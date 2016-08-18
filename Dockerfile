FROM nodesource/jessie:6.3.1

RUN npm install -g babel-cli

ADD package.json package.json
RUN npm install

ADD . .
ENV BABEL_DISABLE_CACHE 1
RUN npm run build
CMD ["node","."]