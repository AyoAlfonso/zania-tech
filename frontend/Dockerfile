# frontend/Dockerfile
FROM node:14

WORKDIR /app

COPY package.json /app

RUN npm install --force

COPY . /app

CMD ["npm", "start"]
