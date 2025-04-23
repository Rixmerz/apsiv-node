# Apsiv Backend

This is the backend for the Apsiv application. It uses Express.js, Prisma ORM, and MySQL.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up MySQL:

On Windows:
- Download and install MySQL from https://dev.mysql.com/downloads/installer/
- During installation, set the root password
- Create a database named `apsiv_db`
- Create a user `admin` with password `123456` and grant all privileges on `apsiv_db`

On Linux/Mac:
- Run the installation script:

```bash
chmod +x install-mysql.sh
./install-mysql.sh
```

3. Configure environment variables:

The `.env` file should already be set up with the following:

```
DATABASE_URL="mysql://admin:123456@localhost:3306/apsiv_db"
PORT=3001
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run migrations:

```bash
npx prisma migrate dev --name init
```

6. Set up the database and create admin user:

```bash
node setup-mysql.js
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The server will run on http://localhost:3001

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires authentication)

### Example Endpoints

- `GET /api/example` - Get all items
- `GET /api/example/:id` - Get item by ID
- `POST /api/example` - Create new item (requires authentication)
- `PUT /api/example/:id` - Update item (requires authentication)
- `DELETE /api/example/:id` - Delete item (requires authentication)

## Admin User

An admin user is automatically created with the following credentials:

- Email: admin@apsiv.com
- Password: 123456
