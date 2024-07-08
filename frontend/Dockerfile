# frontend/Dockerfile
FROM node:14

WORKDIR /app

COPY package.json /app

RUN npm install --force

COPY . /app

RUN npm run build

# Use a lightweight web server to serve the build
RUN npm install -g serve

CMD ["serve", "-s", "build"]