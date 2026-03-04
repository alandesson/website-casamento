# Wedding Invitation Website

This repository contains a simple wedding invitation application split into a React/TypeScript frontend and an Express/TypeScript backend with a SQLite database for recording RSVPs.

## Structure

- `client/` – React + Vite app for the invitation and confirmation form.
- `server/` – Express API that writes to a local SQLite database.

## Getting Started

Install all dependencies at the root (will run for both workspaces):

```bash
npm run install-all
```

### Development

Start both services concurrently:

```bash
npm start
```

- Frontend runs at `http://localhost:3000`.
- Backend runs at `http://localhost:4000`.

Submit the form from the client to record RSVPs in `server/confirmations.db`.

### Building

```bash
npm run --workspace client build
npm run --workspace server build
```


---

Feel free to modify components, styles, or the database schema to suit your needs.