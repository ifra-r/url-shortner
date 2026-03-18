# use official Node 18 alpine image — lightweight
FROM node:18-alpine

# set working directory inside container
WORKDIR /app

# copy package files first (layer caching — only reinstalls if package.json changes)
COPY package*.json ./

# install dependencies
RUN npm install

# copy rest of source code
COPY . .

# expose port app runs on
EXPOSE 5000

# start the app
CMD ["node", "src/app.js"]