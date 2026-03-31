# Match your local Node.js v24 environment
FROM node:24-alpine

# Create app directory
WORKDIR /usr/src

# Install app dependencies by copying package.json AND package-lock.json
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 3000
EXPOSE 3000

# The command to run your app
CMD [ "node", "src/app.js" ]