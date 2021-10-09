FROM node:latest
ENV NODE_ENV=production
ENV SHARE_HELPER_PORT=8099
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY dist/ .
RUN ls -la
CMD [ "node", "index.js" ]
