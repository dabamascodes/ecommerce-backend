<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


<h1 style="text-align:center;">Enterprise E-Commerce Backend (NestJS API)</h1>

A robust, scalable, and production-ready backend system designed for e-commerce operations. Built with **NestJS**, **PostgreSQL**, and **TypeORM**, following clean architecture principles, strict ACID database transactions, and professional development workflows.

### 🚀 Tech Stack
* **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
* **Database & ORM:** PostgreSQL + [TypeORM](https://typeorm.io/)
* **Authentication & Security:** Passport-JWT, Bcrypt, Role-Based Access Control (RBAC)
* **Payments:** Stripe API Webhooks Integration
* **API Documentation:** Swagger / OpenAPI

## 📂 Architecture & Module Breakdown

The application is structured into decoupled, domain-driven modules:

### 1. 🔐 Auth Module (`/auth`)
Handles authentication, authorization, and session management.
* **Key Features:**
  * User registration and login returning JWT Bearer tokens.
  * Password hashing using **Bcrypt**.
  * Dynamic Guards and Decorators (`@Auth()`, `@GetUser()`, `@RawHeaders()`) for route protection.
  * Integration with Role-Based Access Control (RBAC).

### 2. 👤 Users Module (`/users`)
Manages user profiles, role hierarchy, and administrative controls.
* **Roles:** `user`, `admin`, `super-user`.
* **Key Features:**
  * Profile management and administrative user listing.
  * **Role Hierarchy Rules:** Users with the **`super-user`** role hold top-tier privileges, including the exclusive capability to activate or deactivate `admin` accounts.

### 3. 📍 Addresses Module (`/addresses`)
Manages physical shipping and billing locations linked relationally to users.
* **Key Features:**
  * Full CRUD operations for user addresses (`street`, `exteriorNumber`, `interiorNumber`, `neighborhood`, `city`, `state`, `zipCode`, `country`, `phone`).
  * Default address flag management (`isDefault`) ensuring each user has a primary designated shipping destination.

### 4. 📦 Products & Categories Module (`/products`)
Core catalog management handling inventory, pricing, and classifications.
* **Key Features:**
  * CRUD endpoints for product management and categorization.
  * Relational mapping between products, categories, and inventory stock.
  * Paginated product listings and search filtering.

### 5. 🛒 Orders & Order Items Module (`/orders`)
Processes user purchasing workflows, order statuses, and transaction details.
* **Key Features:**
  * Transactional creation of orders linking user profiles, items, and calculated totals.
  * Stock validation and automatic inventory adjustment upon order placement.
  * Cascade management for order items and status tracking (`pending`, `paid`, `shipped`, `cancelled`).

### 6. 💳 Payments Module (`/payments`)
Handles checkout flows and third-party payment gateways.
* **Key Features:**
  * Integration with **Stripe Webhooks** for asynchronous payment verification.
  * Customer mapping and webhook event listeners for order fulfillment.

---

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

## 🌱 Database & Seeding System

This project includes an automated database seeding system designed to populate the database from scratch in a clean, idempotent manner while maintaining strict relational foreign key integrity.

### 1. Default Users, Roles, and Passwords
The user seeding data file (`users-seed.data.json`) initializes key profiles with different access levels, development passwords, and registered addresses:

| Name / User | Email | Dev Password | Assigned Roles | Description & Context |
| :--- | :--- | :--- | :--- | :--- |
| **Peter Parker** | `spiderman@ecommerce.test` | `Admin123!` | `user`, `admin`, `super-user` | Privileged user with elevated system capabilities. Has the exclusive power to activate and deactivate other admin accounts. Registered address in Forest Hills, NY. |
| **Bruce Wayne** | `batman@ecommerce.test` | `Admin123!` | `user`, `admin` | Administrator profile focused on global store management, order operations and operational profile. Registered address in Gotham, NJ. |
| **Tony Stark** | `ironman@ecommerce.test` | `Admin123!` | `user` | Standard e-commerce user profile for regular shopping flow validation. Registered address in Los Angeles, CA. |
| **Clark Kent** | `superman@ecommerce.test` | `Admin123!` | `user` | Standard e-commerce user profile for regular shopping flow validation. Registered address in Metropolis, IL. |


Each user is stored with their password securely hashed using **`bcrypt`** alongside an array of **`Address`** objects (street, exterior and interior numbers, neighborhood, city, state, zip code, country, and `isDefault` flag).

---

### 2. Execution Order & Workflow
To maintain foreign key consistency and satisfy endpoint security rules, seeds must be executed in the following sequential order:

1. **User and Address Seeder (`POST /seed/users`):**
   * **Public / Initial:** Requires no prior authentication.
   * **Prior Cleanup:** Performs a `TRUNCATE CASCADE` across dependent tables (`order_items` $\rightarrow$ `orders` $\rightarrow$ `addresses` $\rightarrow$ `users`), resetting identity sequences.
   * **Result:** Seeds the default users and their relational addresses into the database.

2. **Administrator Authentication (`POST /auth/login`):**
   * **Prerequisite:** Once the user seed finishes, authenticate via the API using an account with an **`admin`** role (e.g., `batman@ecommerce.test` with password `Admin123!`).
   * **JWT Token:** Copy the returned access token (`bearerToken`).

3. **Products and Categories Seeder (`POST /seed/products`):**
   * **Protected Endpoint:** Requires passing the `Authorization: Bearer <JWT_TOKEN>` header from your admin login.
   * **Purpose:** Populates the product catalog and category structures to enable shopping cart, inventory, and order creation simulations.

---

### 3. Nest CLI Configuration (`nest-cli.json`)
To ensure the build directory (`dist`) is wiped clean before each build and static JSON seed files are properly copied over, the project utilizes the following configuration:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      { "include": "seed/data/*.json", "outDir": "dist/seed" }
    ],
    "watchAssets": true
  }
}
```

# 💳 Payment & Webhooks Module (NestJS + PostgreSQL + Stripe, Mock & Hookdeck)

This module manages the complete lifecycle of e-commerce payments through a flexible Strategy Pattern / Dependency Injection architecture. It supports seamless switching between the real Stripe payment gateway and a local simulated (Mock) provider for offline development, ensuring state synchronization with the PostgreSQL database.

---

## 🏗️ Architecture & Responsibilities

1. **Payment Provider (Strategy Pattern):** Controlled via the `PAYMENT_PROVIDER` environment variable, enabling dynamic switching between `stripe` and `mock`.
2. **PostgreSQL (Local Database):** Stores order history, current statuses (`pending` / `paid`), and the associated `paymentIntentId`.
3. **NestJS Backend (Intermediary):** Orchestrates payment intent creation, validates synchronization, and updates PostgreSQL cleanly.
4. **Hookdeck / Stripe CLI (Development Bridge):** Intercepts and routes sandbox events from Stripe servers to the local environment (`localhost:3000`).

---

## ⚙️ Payment Provider Configuration

Control which payment gateway provider the application utilizes by setting the `PAYMENT_PROVIDER` variable in your `.env` file:

* **Real Mode (Stripe):**
  ```env
  PAYMENT_PROVIDER=stripe
  ```
* **Simulated Mode (Mock):**
  ```env
  PAYMENT_PROVIDER=mock
  ```

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

### Option A: Using the Simulated Provider (`PAYMENT_PROVIDER=mock`)
Ideal for rapid local development or offline testing without external dependencies:
1. Create an order via `POST /api/orders`.
2. Initialize the payment intent via `POST /api/payments/create-intent` (generates a mock ID like `pi_mock_...`).
3. Confirm or verify the payment manually via `POST /api/payments/verify-payment` passing the `paymentIntentId`.

### Option B: Using the Real Stripe Provider (`PAYMENT_PROVIDER=stripe`)
1. **Creation and Initiation:** Create an order and generate a Stripe Payment Intent (`/api/payments/create-intent`).
2. **Processing Payment (CLI Simulation):** Confirm a test payment using a test Visa card directly from the terminal:
   ```bash
   stripe payment_intents confirm <PAYMENT_INTENT_ID> \
     --payment-method=pm_card_visa \
     --return-url="http://localhost:3000"
    ```
3. **Synchronizing PAID Status:** Handled automatically via webhook or manually via /verify-payment. 

---

## 🛠️ Local Environment & CLI Setup (Stripe & Hookdeck)

To test the real Stripe workflow locally, tunneling options are available:

### Option A: Hookdeck CLI Setup (Recommended)
Hookdeck acts as a persistent intermediary between Stripe and your local environment.
1. **Listen and tunnel locally with Hookdeck:**
   ```bash
   hookdeck listen 3000 stripe-nestjs-ecommerce-codechallenge
   ```
2. **Register in Stripe Dashboard:** Link the public URL generated by Hookdeck (https://hkdk.events/...) inside your Stripe Sandbox Dashboard.  

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
   Outputs a Webhook Signing Secret (whsec_...) for cryptographic signature validation.
   *This command outputs a **Webhook Signing Secret** (`whsec_...`) used for cryptographic signature validation.*

---

## 🚀 Production Deployment
In a live production environment:
* Hookdeck and Stripe CLI are removed.
* The public server URL (`https://api.yourdomain.com/payments/webhook`) is registered directly in the Production Stripe Dashboard.






