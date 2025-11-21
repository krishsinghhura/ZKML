module.exports = {
  apps: [
    {
      name: "krishna-is_placement",
      script: "app.py",
      interpreter: "/home/ubuntu/uploads/krishna-is_placement/venv/bin/python",
      cwd: "/home/ubuntu/uploads/krishna-is_placement",
      watch: true,
      autorestart: true,
    }
  ]
};
