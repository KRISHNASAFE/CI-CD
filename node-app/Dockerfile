# Use a minimal Node-JS Image.
FROM node:alpine

#Set working directory
WORKDIR app

# Copy package.json & *.json files for docker cache.
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app code
COPY . . 

# Run the app.
CMD [ "node", "server.js" ]
