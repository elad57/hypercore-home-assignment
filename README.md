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
```

### Backend

1. Create the environment file:

```bash
cp packages/backend/.env.example packages/backend/.env
```

The defaults work out of the box. Available variables:

| Variable        | Default                                      | Required | Description                              |
|-----------------|----------------------------------------------|----------|------------------------------------------|
| `PORT`          | —                                            | Yes      | Port the GraphQL server listens on       |
| `DB_PATH`       | —                                            | Yes      | Path to the SQLite database file         |
| `FRED_URL`      | —                                            | Yes      | FRED series page URL for prime rate data |
| `SCRAPE_CRON`   | `0 0 * * *`                                  | No       | Cron expression for periodic re-scraping |
| `SCRAPE_TIMEOUT`| `120000`                                     | No       | Scrape timeout in milliseconds           |

2. Start the backend:

```bash
npm run dev:backend
```

The server starts on `http://localhost:4000`. Database migrations run automatically on first launch and create the SQLite file at the configured `DB_PATH`.

### Frontend

1. Create the environment file:

```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Available variables:

| Variable                 | Default                            | Description                        |
|--------------------------|------------------------------------|------------------------------------|
| `REACT_APP_GRAPHQL_URL`  | `http://localhost:4000/graphql`    | GraphQL endpoint for Apollo Client |
| `REACT_APP_PAGE_SIZE`    | `5`                                | Number of loans shown per page     |

2. Start the frontend:

```bash
npm run dev:frontend
```

The app opens on `http://localhost:3000`.

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
