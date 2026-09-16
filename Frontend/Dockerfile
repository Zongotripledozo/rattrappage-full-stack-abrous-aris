FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Render (et docker-compose en local) fournissent cette valeur au moment du build,
# car Create React App integre REACT_APP_* dans le bundle a la compilation.
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/build ./build

EXPOSE 3000

# -s (single page app) : renvoie index.html pour toute route inconnue,
# indispensable pour que React Router fonctionne apres un rafraichissement.
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
