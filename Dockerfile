FROM node:latest
WORKDIR /opt
ADD package.json ./
RUN npm install
ADD . ./
ENTRYPOINT ["npm", "test"]
