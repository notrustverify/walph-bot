FROM node:lts-alpine3.18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY yarn.lock package*.json ./

RUN yarn
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .
RUN yarn run build
RUN yarn global add pm2

CMD [ "pm2-runtime", "dist/src/bot.js" ]
