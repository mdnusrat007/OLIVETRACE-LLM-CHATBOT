FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install          # full install (dev deps needed for nodemon etc.)

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]