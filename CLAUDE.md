# Hypercore Home Assignment

## Overview

Build a full-stack web application for managing bullet loans and their repayment schedules.

**Submission:** Push to a public GitHub repository and share the link.

If utilizing LLMs — share links to the chats or copy-paste them to `chats.md`.

---

## Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | React, React Router, GraphQL (Apollo Client), Styled Components |
| Backend  | Node.js, GraphQL (Apollo Server), TypeORM           |
| Database | SQLite                                              |

---

## Application Requirements

### Pages

#### `/loans` – Loan List
- Displays a list of all loans, each showing:
  - Loan name
  - Principal amount
  - Start date
  - Total expected interest (sum of all interest payments across the repayment schedule)
- The list should support **pagination**
- Each loan row is clickable and navigates to `/loan/:id`
- A **"New Loan"** button opens a modal with the following fields:
  - Loan name
  - Principal amount
  - Start date
  - End date

#### `/loan/:id` – Repayment Schedule
- Displays the full repayment schedule for the selected loan
- Each row in the schedule should show:
  - Payment date
  - Payment type (Interest or Principal + Interest)
  - Principal component
  - Interest component
  - Total payment amount
  - Remaining balance after payment
- Includes a **Back** button to return to `/loans`

---

## Loan Logic

### Loan Type: Bullet Loan

A bullet loan is a loan where the principal is repaid in full at the end of the loan. Until then, only interest is paid periodically.

**Rules:**
- The loan is disbursed on the start date for the full principal amount
- Monthly interest payments are due on the **last day of each calendar month** between the start date and end date
- On the end date (maturity), the borrower pays the **remaining principal plus any remaining interest** for the final month
- There is **no amortization** — the outstanding principal remains constant until maturity (principal is paid in full on end date)

### Interest Rate

- **Source:** Scrape the Daily Prime Rate from: `https://fred.stlouisfed.org/series/PRIME`
- **Method:** 30/360 interest — if the rate hasn't changed, every month accrues the same interest regardless of the number of days
- **Formula for a complete month with no rate changes:**
  ```
  interest per month = principal × (annual_rate / 12)
  ```
- **Rate changes:** The prime rate may change multiple times during a month or mid-month. Apply each rate only to the days it was in effect within that period, rather than using a single rate for the entire period.

---

## Data Model

Minimum required entities:

**Loan:** `id`, `name`, `principal amount`, `start date`, `end date`, `interest rate` (at time of creation)

**RepaymentSchedule / Payment:** `id`, `loan id`, `payment date`, `principal`, `interest`, `total`, `remaining balance`

---

## GraphQL API

Minimum required operations:

- `loans` — query to list all loans with total expected interest
- `loan(id)` — query to fetch a single loan with its repayment schedule
- `createLoan(input)` — mutation to create a loan (fetches current rate, generates and persists the full repayment schedule)

---

## Setup & Reproducibility

The repository should include:

- A `README.md` with instructions to:
  - Run the backend
  - Run the frontend
- Database migrations or **auto-sync via TypeORM** to set up the schema on first run

---

## Notes

- Do **not** use any loan calculation libraries — implement the logic yourself
- The interest rate should be **fetched and stored at time of loan creation** (not re-fetched dynamically)
- You may use any Apollo, TypeORM, or React libraries/helpers you're comfortable with
