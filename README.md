## Inventory App (Node + React + MongoDB)

This is a small, extensible inventory management project built with:

- **Backend**: Node.js, Express, TypeScript, MongoDB (via Mongoose)
- **Frontend**: React, TypeScript, Vite

### Features (Current)

- **Inventory items**:
  - Create, read, update, delete items
  - Basic fields: `name`, `sku`, `quantity`, `price`, `description`, `createdAt`, `updatedAt`

### Planned Extensions

- Authentication & authorization
- Categories, suppliers, purchase/sales modules
- Reporting & dashboards

### Project Structure

- `server/` – Node/Express API (TypeScript)
- `client/` – React UI (TypeScript, Vite)

### Prerequisites

- **Node.js**: v18+ recommended
- **MongoDB**: local instance or cloud (e.g. MongoDB Atlas)

### Getting Started

#### 1. Backend (server)

```bash
cd server
npm install
cp .env.example .env  # On Windows, you can copy manually
npm run dev
```

The backend will start on `http://localhost:4000` by default.

#### 2. Frontend (client)

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (or the port Vite chooses).

### Environment Variables (Backend)

Create a `server/.env` file based on `.env.example`:

- `PORT` – API port (default `4000`)
- `MONGODB_URI` – MongoDB connection string
  - e.g. `mongodb://localhost:27017/inventory_app`

### Coding Standards

- **TypeScript** for type safety (backend & frontend)
- **ESLint + Prettier** for consistent style
- Modular structure (controllers, routes, models, config) to keep the codebase maintainable and easy to extend.

"Test change" 
