FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && npm prune --production && rm -rf src

# Start
CMD [ "npm", "run", "prod" ]