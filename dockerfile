FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

RUN apk add --no-cache bash && \
    echo "if [ ! -d /app/node_modules ]; then npm install --production; fi" > /tmp/start.sh && \
    echo "npm start" >> /tmp/start.sh && \
    chmod +x /tmp/start.sh

COPY . .

CMD ["/bin/bash", "/tmp/start.sh"]