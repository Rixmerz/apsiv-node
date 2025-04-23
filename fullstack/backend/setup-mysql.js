/**
 * MySQL Database Setup Script
 * 
 * This script creates the MySQL database and admin user.
 * Run with: node setup-mysql.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  try {
    // Connect to MySQL server as root
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Add your root password here if needed
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    console.log('Creating database if it doesn\'t exist...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS apsiv_db');
    
    // Create admin user if it doesn't exist
    console.log('Creating admin user if it doesn\'t exist...');
    try {
      await connection.execute(`CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY '123456'`);
      await connection.execute(`GRANT ALL PRIVILEGES ON apsiv_db.* TO 'admin'@'localhost'`);
      await connection.execute('FLUSH PRIVILEGES');
      console.log('Admin user created successfully');
    } catch (error) {
      console.error('Error creating admin user:', error.message);
    }

    await connection.end();
    console.log('MySQL connection closed');

    // Now use Prisma to create tables and seed admin user
    console.log('Setting up database schema with Prisma...');
    const prisma = new PrismaClient();

    try {
      // Create admin user in the application
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@apsiv.com' },
        update: {},
        create: {
          email: 'admin@apsiv.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin'
        }
      });
      
      console.log('Admin user created in application:', adminUser);
    } catch (error) {
      console.error('Error creating admin user in application:', error.message);
      console.log('You may need to run migrations first with: npx prisma migrate dev');
    }

    await prisma.$disconnect();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
