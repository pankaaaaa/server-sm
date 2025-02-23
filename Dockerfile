FROM node:16-alpine 

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm","run","server"]

# // "server": "tsnd --respawn -r tsconfig-paths/register --pretty --transpile-only ./src/index.ts",
# // "build": "npm i && tsc && tsc-alias && npm run prisma:generate",
# // "start": "node ./dist",