
FROM node:23.11.0-bookworm

RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    cargo \
    npm


WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npm run build


EXPOSE 3000

CMD ["npm", "start"]