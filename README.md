<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Enterprise E-Commerce Backend (NestJS API)

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

3. **Install dependencies:**
   ```bash
    npm install
    ```

4. **Start the database (PostgreSQL) using Docker:**
    ```bash
    docker compose up -d
    ```

5. **Run the application in development mode:**
    ```bash
    npm run start:dev
    ```

### 🌿 Gitflow Strategy
Project development follows a strict branching model:
- `main`: Production-ready code.
- `develop`: Primary integration branch for development.
- `feature/*`: Feature branches for new functionality.