from flask import Flask, request, jsonify
import pickle
import numpy as np
import sys

app = Flask(__name__)

# Global variable for the model
crop_model = None

# Load the model on app startup
try:
    model_path = 'crop_recommendation.pkl'
    with open(model_path, 'rb') as model_file:
        crop_model = pickle.load(model_file)
    print(f"Model '{model_path}' loaded successfully.")
except FileNotFoundError:
    print(f"Error: Model file '{model_path}' not found. Please ensure the model file is in the same directory.", file=sys.stderr)
    sys.exit(1) # Exit if the model is essential and not found
except Exception as e:
    print(f"Error loading model from '{model_path}': {e}", file=sys.stderr)
    sys.exit(1)

@app.route('/predict', methods=['POST'])
def predict():
    if crop_model is None:
        # This case should ideally not be reached if sys.exit(1) works correctly
        return jsonify({"success": False, "prediction": None, "error": "Model not loaded. Server configuration error."}), 500

    try:
        data = request.get_json()
        if data is None:
            return jsonify({"success": False, "prediction": None, "error": "Invalid JSON input. Expected a list of numerical features."}), 400

        # Assuming data is a list of numerical features, e.g., [N, P, K, temp, hum, ph, rainfall]
        # The prompt states 'keys undefined', so an ordered list is a reasonable interpretation.
        if not isinstance(data, list):
            return jsonify({"success": False, "prediction": None, "error": "Input must be a JSON array (list) of numerical features."}), 400

        features = []
        for item in data:
            if not isinstance(item, (int, float)):
                return jsonify({"success": False, "prediction": None, "error": f"All features in the input array must be numerical. Found non-numeric type: {type(item).__name__}."}), 400
            features.append(item)

        # Scikit-learn models typically expect a 2D array, even for a single sample: [[feature1, feature2, ...]]
        features_array = np.array(features).reshape(1, -1)

        prediction = crop_model.predict(features_array)
        
        # Convert prediction result to a Python list or scalar for JSON serialization
        # This handles cases where prediction is a numpy array (most common) or a single scalar result.
        if isinstance(prediction, np.ndarray):
            prediction_result = prediction.tolist()
            # If the prediction is a single item (e.g., a single crop name string), unwrap it
            if len(prediction_result) == 1:
                prediction_result = prediction_result[0]
        else:
            prediction_result = prediction # In case model.predict returns a non-ndarray directly (less common)

        return jsonify({"success": True, "prediction": prediction_result, "error": None})

    except Exception as e:
        # Log the full exception for debugging purposes
        app.logger.exception("An error occurred during prediction:")
        return jsonify({"success": False, "prediction": None, "error": f"An internal server error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    # PORT should be between 3001-3010
    app.run(host="0.0.0.0",debug=False, port=3005)
