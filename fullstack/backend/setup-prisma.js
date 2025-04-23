/**
 * Prisma Setup Script
 * 
 * This script sets up Prisma with SQLite for development
 * Run with: node setup-prisma.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function setupPrisma() {
  try {
    console.log('Setting up Prisma with SQLite for development...');
    
    // Update .env file to use SQLite
    const envPath = path.join(__dirname, '.env');
    const envContent = `# Database connection
DATABASE_URL="file:./dev.db"

# Server configuration
PORT=3001

# JWT Secret
JWT_SECRET="your-secret-key"

# Environment
NODE_ENV="development"`;

    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env file to use SQLite');

    // Update schema.prisma to use SQLite
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    const schemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Define your models here

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("user") // "admin" or "user"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;

    fs.writeFileSync(schemaPath, schemaContent);
    console.log('Updated schema.prisma to use SQLite');

    // Generate Prisma client
    console.log('Generating Prisma client...');
    require('child_process').execSync('npx prisma generate', { stdio: 'inherit' });

    // Run migrations
    console.log('Running Prisma migrations...');
    try {
      require('child_process').execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    } catch (error) {
      console.log('Migration may have already been applied or there was an error.');
      console.log('Continuing with setup...');
    }

    // Create admin user
    console.log('Creating admin user...');
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
    }

    await prisma.$disconnect();
    console.log('Prisma setup completed successfully');
  } catch (error) {
    console.error('Prisma setup failed:', error.message);
    process.exit(1);
  }
}

setupPrisma();
