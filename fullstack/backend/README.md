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

- `POST /api/users/register` - Register a new user (always as patient)
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires authentication)

### Appointments

- `GET /api/appointments` - Get all appointments (admin only)
- `GET /api/appointments/doctor/:doctorId` - Get doctor appointments
- `GET /api/appointments/patient/:patientId` - Get patient appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:userId/role` - Update user role (admin only)
- `DELETE /api/admin/users/:userId` - Delete user (admin only)

### Example Endpoints

- `GET /api/example` - Get all items
- `GET /api/example/:id` - Get item by ID
- `POST /api/example` - Create new item (requires authentication)
- `PUT /api/example/:id` - Update item (requires authentication)
- `DELETE /api/example/:id` - Delete item (requires authentication)

## User Roles

The application has three user roles:

1. **Admin**: Can manage all users, appointments, and system settings
2. **Doctor**: Can view and manage their appointments and patient information
3. **Patient**: Can book appointments with doctors and manage their own profile

### Default Users

**Admin User**:
- Email: admin@apsiv.com
- Password: 123456

**Test Doctor**:
- Email: doctor@example.com
- Password: 123456

### Role Management

- New users can only register as patients
- Only admin users can change user roles
- A user can only have one role at a time (admin, doctor, or patient)
- When changing a user's role, their previous role-specific profile is deleted
