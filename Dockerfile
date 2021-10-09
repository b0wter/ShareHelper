FROM node:latest
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY dist/ .
RUN ls -la
CMD [ "node", "index.js" ]
