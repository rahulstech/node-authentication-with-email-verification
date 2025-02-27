FROM node:22-alpine

WORKDIR /www

COPY . .

RUN mv .env-prod .env

ENV NODE_ENV=production

EXPOSE 5000

RUN npm install

RUN mv docker-entrypoint-nodeapp.sh /docker-entrypoint-nodeapp.sh
RUN chmod +x /docker-entrypoint-nodeapp.sh

ENTRYPOINT ["/docker-entrypoint-nodeapp.sh"]

CMD ["npm", "start"]

