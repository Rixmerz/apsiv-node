/**
 * Create Admin User Script
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    const prisma = new PrismaClient();

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
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
}

createAdminUser();
