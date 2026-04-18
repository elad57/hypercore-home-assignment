# Hypercore Home Assignment

A full-stack web application for managing bullet loans and their repayment schedules.

## Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | React, React Router, Apollo Client, Styled Components |
| Backend  | Node.js, Apollo Server, TypeORM                     |
| Database | SQLite                                              |

---

## Running with Docker (recommended)

Requires [Docker](https://www.docker.com/) with Compose.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend (GraphQL): http://localhost:4000/graphql

> On first start the backend scrapes live prime rate data from FRED before accepting requests. This takes ~15–30 seconds. The frontend will show an error if you create a loan before the scrape completes — just wait a moment and retry.

---

## Running locally

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

From the repo root:

```bash
npm install
npm install react-scripts@5.0.1 --legacy-peer-deps -w packages/frontend
npm install ajv@8 --legacy-peer-deps
```

> The extra commands work around npm workspaces hoisting issues: `react-scripts` may be installed as a hollow stub, and `ajv@8` (required by `react-scripts`'s webpack config) may not be hoisted automatically.

### Environment files

```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

Backend variables:

| Variable         | Required | Description                              |
|------------------|----------|------------------------------------------|
| `PORT`           | Yes      | Port the GraphQL server listens on       |
| `DB_PATH`        | Yes      | Path to the SQLite database file         |
| `FRED_URL`       | Yes      | FRED series page URL for prime rate data |
| `SCRAPE_CRON`    | No       | Cron expression for periodic re-scraping (default: `0 0 * * *`) |
| `SCRAPE_TIMEOUT` | No       | Scrape timeout in milliseconds (default: `120000`) |

Frontend variables:

| Variable                | Description                        |
|-------------------------|------------------------------------|
| `REACT_APP_GRAPHQL_URL` | GraphQL endpoint for Apollo Client |
| `REACT_APP_PAGE_SIZE`   | Number of loans shown per page     |

### Build

```bash
npm run build:backend   # Compile backend TypeScript → dist/
npm run build:frontend  # Bundle React app → build/
npm run build           # Both sequentially
```

### Start

Run each in a separate terminal:

```bash
npm run dev:backend    # GraphQL server on http://localhost:4000
npm run dev:frontend   # React app on http://localhost:3000
```

Database migrations run automatically on first launch.


---

## Project structure

```
/
├── docker-compose.yml
├── package.json                  # npm workspaces root
└── packages/
    ├── backend/
    │   └── src/
    │       ├── entities/         # TypeORM entities (Loan, RepaymentSchedule)
    │       ├── migrations/       # Database migrations
    │       ├── resolvers/        # GraphQL resolvers
    │       ├── services/         # Business logic (loans, schedule, rates)
    │       ├── plugins/          # Apollo Server plugins (logging)
    │       └── utils/            # Date math (30/360), debug logger
    └── frontend/
        └── src/
            ├── apollo/           # Apollo Client setup
            ├── components/       # Shared + feature components
            ├── graphql/          # Queries and mutations
            ├── pages/            # Route-level components
            ├── theme/            # Styled Components theme
            ├── types/            # GraphQL response types
            └── utils/            # Formatting helpers, validation
```

---

## GraphQL API

| Operation          | Type     | Description                                              |
|--------------------|----------|----------------------------------------------------------|
| `loans`            | Query    | Paginated loan list with total expected interest         |
| `loan(id)`         | Query    | Single loan with full repayment schedule                 |
| `createLoan(input)`| Mutation | Create a loan — fetches current rate, generates schedule |

Explore the schema interactively at http://localhost:4000/graphql (Apollo Sandbox).
