# one-pay-admin

# Build & Run Application
sudo docker compose up --build -d

# Run Applications
sudo docker compose up -d

# Endpoints
OnePayAdmin: http://localhost:4200/

# Useful Comands 
    Angular Serve: sudo docker exec one-pay-admin ng s --host 0.0.0.0
    Rebuild and Run Application : sudo docker compose build --no-cache && sudo docker compose up -d