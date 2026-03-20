# looloo-web

# Build & Run Application
sudo docker compose up --build -d

# Run Applications
sudo docker compose up -d

# Endpoints
Looloo Web: http://localhost:4200/

# Useful Comands 
    Angular Serve: sudo docker exec one-pay-admin ng s --host 0.0.0.0
    Rebuild and Run Application : sudo docker compose build --no-cache && sudo docker compose up -d
    Angular Production Build: docker run --rm -v ./:/app -w /app node:18.18.0-slim sh -c "npm install && npm run build --prod && cp -r dist /app/dist-copy && rm -rf node_modules"
