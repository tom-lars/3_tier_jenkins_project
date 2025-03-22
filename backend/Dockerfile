FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create public directory for static files
RUN mkdir -p public
COPY index.html public/

EXPOSE 3000

CMD ["node", "app.js"]