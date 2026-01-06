# E-commerce Backend API

Demo backend for a product catalog, built with **Node.js**, **TypeScript**, and **Prisma**. It exposes a small JSON REST API to list, filter, and create products.

## Tech stack

- **Node.js** + **Express**: HTTP server and routing (`src/server.ts`, `src/routes/`)
- **TypeScript**: static typing (see `tsconfig.json`)
- **Prisma ORM** + **SQLite**: database access (`prisma/schema.prisma`, `dev.db` / `prisma/dev.db`)
- **Zod**: request payload validation for the endpoints (e.g. `src/routes/products.ts`)

## Installation & running

From the `backend` folder:

```powershell
npm install
npm run dev
```

- By default, the API is available at `http://localhost:4000`.
- Dev mode runs the TypeScript server with hot reload.

Useful scripts (from `package.json`):

- `npm run dev`: run the server in development mode (`ts-node-dev --respawn --transpile-only src/server.ts`).
- `npm run build`: compile TypeScript into `dist/`.
- `npm start`: start the compiled server (`node dist/server.js`).
- `npm run prisma:generate`: generate the Prisma client.
- `npm run prisma:migrate`: run `prisma migrate dev` to apply migrations.
- Seed the database (initial data):

```powershell
npx prisma db seed
```

(The `prisma.seed` command is configured to run `ts-node-dev --transpile-only prisma/seed.ts`.)

## Base URL & health

- **Local base URL**: `http://localhost:4000`
- **Health check**: `GET /` → returns a small JSON object indicating that the API is up (see `src/server.ts`).
- All responses are **JSON**.
- For POST requests, send `Content-Type: application/json`.

## Products API

### 1. GET /products

List all products.

- **Method**: `GET`
- **URL**: `/products`
- **Optional query params**:
  - `category` *(string)*: filter by category, e.g. `?category=Apparel`
- **200 response**: array of products, each product having this shape:

```jsonc
[
  {
    "id": 1,
    "name": "T-Shirt",
    "price": 19.99,
    "imageUrl": "https://example.com/tshirt.png",
    "category": "Apparel",
    "inStock": true,
    "variants": ["S", "M", "L"]
  }
]
```

> Note: in the database, `variants` is stored as a JSON string, but the API already returns it as an **array**.

### 2. GET /products/:id

Get a product by its identifier.

- **Method**: `GET`
- **URL**: `/products/:id`
- **Path parameters**:
  - `id` *(number)*: numeric product id
- **Status codes**:
  - `200`: product found
  - `400`: invalid id (not a number) → `{ "error": "Invalid ID" }`
  - `404`: product not found → `{ "error": "Not found" }`
- **200 response**: a single product with `variants` already parsed as an array.

### 3. POST /products

Create a new product.

- **Method**: `POST`
- **URL**: `/products`
- **JSON body** (schema validated by Zod in `ProductSchema`):

```jsonc
{
  "name": "T-Shirt",
  "price": 19.99,
  "imageUrl": "https://example.com/tshirt.png",
  "category": "Apparel",
  "inStock": true,
  "variants": ["S", "M", "L"]
}
```

Main constraints:

- `name`: string, min. 2 characters
- `price`: positive number
- `imageUrl`: valid URL
- `category`: string
- `inStock`: boolean
- `variants`: array of non-empty strings

- **Status codes**:
  - `201`: product successfully created → returns the created product, with `variants` as an array
  - `400`: invalid body → returns Zod validation errors (flatten format)

## Example requests (curl)

Assuming the backend is running on `http://localhost:4000`:

### List all products

```powershell
curl http://localhost:4000/products
```

### List products by category

```powershell
curl "http://localhost:4000/products?category=Apparel"
```

### Get a product by id

```powershell
curl http://localhost:4000/products/1
```

### Create a product

```powershell
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "T-Shirt",
    "price": 19.99,
    "imageUrl": "https://example.com/tshirt.png",
    "category": "Apparel",
    "inStock": true,
    "variants": ["S", "M", "L"]
  }'
```

> In PowerShell, be careful with quotes; if needed, use double quotes for JSON or a `.json` file with `-d (Get-Content body.json -Raw)`.

## Deliverables summary

- **API documentation**: this `README.md` describes the main endpoints (`GET /products`, `GET /products/:id`, `POST /products`).
- **Tech stack note**: Node.js, TypeScript, Prisma, Express, Zod.
- **How to run the project**: `npm install` then `npm run dev`.
- **Examples**: several `curl` commands above.

## Possible improvements

- Add authentication/authorization to secure product creation.
- Add pagination, sorting, and more advanced filters on `GET /products`.
- Add more resources (users, orders, cart) and their routes.
- Write automated tests (Jest + supertest) and integrate a CI pipeline.
- Generate Swagger / OpenAPI documentation or exportable Postman collection.
