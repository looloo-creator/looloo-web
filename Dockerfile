FROM node:24-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./

RUN npm install
# RUN npm install pm2 -g

COPY . .

CMD ["npm", "start", "--", "--host", "0.0.0.0"]
