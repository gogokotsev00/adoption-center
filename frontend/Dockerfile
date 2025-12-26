FROM node:24.12.0 as BUILD
WORKDIR /src
RUN npm install -g @angular/cli

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN ng build --configuration=production --output-path=dist

FROM nginx:stable AS final
EXPOSE 80
COPY --from=build src/dist/browser /usr/share/nginx/html
