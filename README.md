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

## Updating the assistant package

The app installs the Angular library from `vendor/looloo-assistant-0.1.0.tgz`.
After changing the library, rebuild and pack it from the workspace root:

```sh
cd ../looloo-assistant
npm run build
npm pack ./dist/looloo-assistant --pack-destination ../looloo-web/vendor
cd ../looloo-web
npm install ./vendor/looloo-assistant-0.1.0.tgz --save
```

Commit the refreshed tarball together with `package.json` and `package-lock.json`.

## Running the assistant backend locally

Start `chatbot-api` on port `3001` with Ollama and its configured databases
running. Its `JWT_SECRET_KEY` must match `looloo-api/.env`; the assistant sends
the current user's login token with each request. The web app's
`chatbotApiUrl` is set in the environment files and defaults to
`http://localhost:3001` for local use. Set it to the deployed API URL before
building for production.
