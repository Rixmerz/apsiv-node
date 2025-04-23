@echo off
echo ===== Apsiv Fullstack Setup =====
echo This script will help you set up the Apsiv fullstack application.

rem Install root dependencies
echo Installing root dependencies...
call npm install

rem Install frontend and backend dependencies
echo Installing frontend and backend dependencies...
cd frontend
call npm install
cd ../backend
call npm install
cd ..

rem Set up the database
echo Setting up the database...
cd backend

rem Generate Prisma client
echo Generating Prisma client...
call npx prisma generate

rem Run Prisma migrations
echo Running Prisma migrations...
call npx prisma migrate dev --name init

rem Run the setup script
echo Setting up MySQL database and admin user...
call node setup-mysql.js

cd ..

echo ===== Setup Complete =====
echo You can now start the application with: npm run dev
pause
