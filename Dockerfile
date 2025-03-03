FROM node:22-alpine

WORKDIR /www

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

RUN npm install

RUN chmod +x entrypoint.sh

ENTRYPOINT [ "/www/entrypoint.sh" ]

CMD ["npm", "start"]
