FROM oven/bun:1.3.9

WORKDIR /app

COPY package.json bunfig.toml tsconfig.json ./
RUN bun install

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=4001

EXPOSE 4001

CMD ["/app/docker-entrypoint.sh"]
