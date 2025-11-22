import os
import pickle
from flask import Flask, request, jsonify

app = Flask(__name__)

# Model loading
MODEL_PATH = 'is_placement.pkl'
model = None
model_load_error = None

try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print(f"Model '{MODEL_PATH}' loaded successfully.")
    else:
        model_load_error = f"Model file '{MODEL_PATH}' not found in the current directory: {os.getcwd()}"
        print(model_load_error)
except Exception as e:
    model_load_error = f"Error loading model: {e}"
    print(model_load_error)

@app.route('/predict', methods=['POST'])
def predict():
    # Check if the model was loaded successfully
    if model is None:
        return jsonify({"success": False, "prediction": None, "error": model_load_error or "Model not loaded."}), 500

    # Get JSON input from the request
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "prediction": None, "error": "Invalid JSON input or no data provided."}), 400

    # CRITICAL FIX: This list now contains exactly 17 input features, matching the model's expectation.
    # 'is_placed' is the target variable and MUST be excluded from the input features.
    required_keys = [
        "tier", "cgpa", "inter_gpa", "ssc_gpa", "internships", "no_of_projects",
        "is_participate_hackathon", "is_participated_extracurricular",
        "no_of_programming_languages", "dsa", "mobile_dev", "web_dev",
        "Machine Learning", "cloud", "CSE", "ECE", "MECH"
    ]

    # Check for missing keys
    missing_keys = [key for key in required_keys if key not in data]
    if missing_keys:
        return jsonify({"success": False, "prediction": None, "error": f"Missing required keys in input: {', '.join(missing_keys)}"}), 400

    try:
        # Prepare features list in the correct order (17 features)
        features = [data[key] for key in required_keys]

        # Model expects a 2D array (e.g., [[feature1, feature2, ...]]) for a single sample
        prediction_result = model.predict([features]).tolist()

        return jsonify({"success": True, "prediction": prediction_result, "error": None})

    except Exception as e:
        # Catch any errors during prediction (e.g., model input format issues, internal model errors)
        return jsonify({"success": False, "prediction": None, "error": f"Error during prediction: {e}"}), 500

if __name__ == '__main__':
    # Run the Flask app in debug mode
    # In a production environment, set debug=False and use a production-ready WSGI server
    app.run(host="0.0.0.0",debug=True, use_reloader=False)