#!/bin/bash

# MySQL Installation and Setup Script

echo "===== MySQL Installation and Setup ====="
echo "This script will help you install MySQL and set up the database for the Apsiv application."

# Check if MySQL is installed
if command -v mysql &> /dev/null; then
    echo "MySQL is already installed."
else
    echo "MySQL is not installed. Installing MySQL..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            sudo apt-get update
            sudo apt-get install -y mysql-server
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            sudo yum install -y mysql-server
        else
            echo "Unsupported Linux distribution. Please install MySQL manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mysql
            brew services start mysql
        else
            echo "Homebrew not found. Please install Homebrew first or install MySQL manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        echo "On Windows, please download and install MySQL from https://dev.mysql.com/downloads/installer/"
        echo "After installation, please run this script again."
        exit 1
    else
        echo "Unsupported operating system. Please install MySQL manually."
        exit 1
    fi
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Run the setup script
echo "Setting up MySQL database and admin user..."
node setup-mysql.js

echo "===== Installation Complete ====="
echo "You can now start the server with: npm run dev"
