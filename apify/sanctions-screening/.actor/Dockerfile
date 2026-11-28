FROM apify/actor-node:20
COPY .actor/package.json ./
RUN npm --quiet set progress=false && npm install --omit=dev --omit=optional --no-audit --no-fund
COPY .actor/ ./
CMD npm start --silent
