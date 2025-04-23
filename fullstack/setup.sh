#!/bin/bash

# Apsiv Fullstack Setup Script

echo "===== Apsiv Fullstack Setup ====="
echo "This script will help you set up the Apsiv fullstack application."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend and backend dependencies
echo "Installing frontend and backend dependencies..."
cd frontend && npm install
cd ../backend && npm install
cd ..

# Set up the database
echo "Setting up the database..."
cd backend

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Run the setup script
echo "Setting up MySQL database and admin user..."
node setup-mysql.js

cd ..

echo "===== Setup Complete ====="
echo "You can now start the application with: npm run dev"
