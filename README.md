# worker-node

Worker repo for backend (Node.js, Express, TypeScript, Sequelize, MySQL).

## Documentation

- **[Google OAuth setup & testing guide](./docs/OAUTH.md)** — Google Cloud Console, OAuth 2.0 Playground, Postman, JWT flow, and troubleshooting

## Quick start

```bash
npm install
cp .env.example .env   # configure DB and OAuth credentials
npm run db:migrate
npm run build
npm run start
```

Health check: `GET http://localhost:3000/health`
