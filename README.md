<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


<h1 style="text-align:center;">Enterprise E-Commerce Backend (NestJS API)</h1>

A robust, scalable, and production-ready backend system designed for e-commerce operations. Built with **NestJS**, **PostgreSQL**, and **TypeORM**, following clean architecture principles, strict ACID database transactions, and professional development workflows.

### 🚀 Tech Stack
- **Framework:** NestJS (Node.js/TypeScript)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Containers:** Docker & Docker Compose
- **Validation & Configuration:** `@nestjs/config`, Joi, `class-validator`, `class-transformer`
- **Authentication & Security:** JWT, Passport, Bcrypt
- **Version Control:** Git (Gitflow Workflow)

### 🛠️ Prerequisites
Ensure you have the following installed locally:
- **Node.js:** `>=18.x`
- **npm:** `>=9.x`
- **Docker & Docker Compose**
- **Git**

### ⚙️ Setup & Installation
1. **Clone the repository:**
    ```bash
    git clone git@github.com:dabamascodes/ecommerce-backend.git
    cd ecommerce-backend
    ```

2. **Configure environment variables:**
    Copy the template `.env.template` file to create your local `.env`:
    ```bash
    cp .env.template .env
    ```
    Open the generated `.env` file and configure your credentials (e.g., database password and secret keys):
    ```env
    DB_PASSWORD=my_secure_db_password
    JWT_SECRET=super_secret_jwt_key_for_production_and_dev
    ```

3. **Install dependencies:**
   ```bash
    npm install
    ```

### 🏃 Running the Application
You can choose between two development environments depending on your preference:

#### Option A: Local App Development (Recommended)
Run PostgreSQL inside a Docker container while running the NestJS application directly on your host machine for faster iteration.

1. **Start the database (PostgreSQL) using Docker:**
    ```bash
    docker compose up -d db
    ```

2. **Run the application in development mode:**
    ```bash
    npm run start:dev
    ```

3. **How to stop Option A:**
    - To stop the NestJS application running in your terminal, press **`Ctrl + C`**.
    - To stop the PostgreSQL database container, run:
      ```bash
      docker compose stop db
      ```
    - *(Optional)* To completely stop and remove the database container and its network:
      ```bash
      docker compose down
      ```

#### Option B: Fully Dockerized Development (with Hot-Reloading)    
Run both PostgreSQL and the NestJS application fully containerized within Docker, with code changes automatically hot-reloaded.

1. **Start all services in hot-reloading mode:**
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    ```
2. **Stop the containerized environment:**
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.dev.yml down
    ```

### 💡 Troubleshooting

#### Permission issues in `dist/` when switching environments
If you switch from a fully containerized execution (Option B) back to local development (Option A) and encounter an `EACCES: permission denied` error when running `npm run start:dev`, it is because Docker created the build artifacts inside `dist/` under root permissions.

To resolve this, clean or reclaim ownership of the build directory:

```bash
sudo rm -rf dist
# or
sudo chown -R $USER:$USER dist
```

### 🌿 Gitflow Strategy
Project development follows a strict branching model:
- `main`: Production-ready code.
- `develop`: Primary integration branch for development.
- `feature/*`: Feature branches for new functionality.



# 💳 Payment & Webhooks Module (NestJS + PostgreSQL + Stripe + Hookdeck)

This module manages the complete lifecycle of e-commerce payments, ensuring state synchronization between the Stripe payment gateway and the local PostgreSQL database through both manual (Frontend) and automatic (Server-to-Server) mechanisms.

---

## 🏗️ Architecture & Responsibilities

1. **Stripe (Payment Gateway / Cloud):** Single source of truth for funds. Processes card payments, manages states (`requires_payment_method` -> `succeeded`), and emits payment events.
2. **PostgreSQL (Local Database):** Stores the order history, their current status (`pending` / `paid`), and the associated `paymentIntentId`.
3. **NestJS Backend (Intermediary):** Orchestrates payment intent creation, validates synchronization with Stripe, and updates PostgreSQL.
4. **Hookdeck / Stripe CLI (Development Bridge):** Intercepts and routes sandbox events from Stripe servers to the local environment (`localhost:3000`).

---

## 🔌 Payment Module Endpoints

| Method | Endpoint | Description | Swagger Visibility |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/orders` | Creates an order locally with `pending` status. | Visible |
| **POST** | `/api/payments/create-intent` | Requests a `PaymentIntent` from Stripe and links its ID to the order. | Visible |
| **POST** | `/api/payments/verify-payment` | **Manual / Frontend** sync: Queries Stripe status and updates the order to `paid`. | Visible |
| **POST** | `/api/payments/webhook` | **Automatic (Server-to-Server)** sync: Asynchronously receives Stripe events to update orders in the background. | Hidden (`@ApiExcludeEndpoint`) |

> **Security & Swagger Note:** The webhook endpoint is decorated with `@ApiExcludeEndpoint()` from `@nestjs/swagger` to keep it hidden from the public API documentation, as it must only accept requests cryptographically signed by Stripe.

---

## 🔄 Payment Flow & Synchronization

### 1. Creation and Initiation
* The client creates an order (`/api/orders`).
* A payment intent is created in Stripe, and its ID is stored in the local database (`/api/payments/create-intent`).

### 2. Processing Payment (CLI Simulation)
To confirm a test order payment using a test Visa card directly from the terminal:
```bash
stripe payment_intents confirm <PAYMENT_INTENT_ID> \
  --payment-method=pm_card_visa \
  --return-url="http://localhost:3000"
```

### 3. Synchronizing `PAID` Status
* **Manual Path (`/verify-payment`):** Triggered directly by the Frontend to update PostgreSQL immediately upon receiving a successful confirmation screen.
* **Automatic Path (`/payments/webhook`):** Automatic server fallback triggered when Stripe sends the `payment_intent.succeeded` event.

---

## 🛠️ Local Environment & CLI Setup

To test the complete workflow locally, two webhook tunneling options are available:

### Option A: Hookdeck CLI Setup (Recommended)
Hookdeck acts as a persistent intermediary between Stripe and your local environment.

1. **Listen and tunnel locally with Hookdeck:**
   ```bash
   hookdeck listen 3000 stripe-nestjs-ecommerce-codechallenge
   ```
   *(Global NVM path: `/home/daniel/.nvm/versions/node/v24.16.0/bin/hookdeck listen 3000 stripe-nestjs-ecommerce-codechallenge`)*

2. **Register in Stripe Dashboard:**
   The public URL generated by Hookdeck (`https://hkdk.events/...`) is registered as a webhook destination within the Stripe Sandbox Dashboard (`hookdeck-nestjs-ecommerce-codechallenge`).

---

### Option B: Direct Stripe CLI Setup

1. **Authenticate with Stripe CLI:**
   ```bash
   stripe login
   ```
   *Confirm the displayed authorization code by following the browser prompt.*

2. **Listen and forward events directly:**
   ```bash
   stripe listen --forward-to localhost:3000/payments/webhook --events payment_intent.succeeded
   ```
   *This command outputs a **Webhook Signing Secret** (`whsec_...`) used for cryptographic signature validation.*

---

## 🚀 Production Deployment
In a live production environment:
* Hookdeck and Stripe CLI are removed.
* The public server URL (`https://api.yourdomain.com/payments/webhook`) is registered directly in the Production Stripe Dashboard.