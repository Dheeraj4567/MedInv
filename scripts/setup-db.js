#!/usr/bin/env node

/**
 * MedInv Database Setup Script
 * 
 * This script helps set up the database for the MedInv application.
 * It can be used in both local development and for generating SQL for cloud databases.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define database schema
const schema = fs.readFileSync(path.join(__dirname, '../db-schema.md'), 'utf8');
const schemaRegex = /```sql\n([\s\S]*?)```/g;
let match;
const sqlStatements = [];

while ((match = schemaRegex.exec(schema)) !== null) {
  const sqlBlock = match[1].trim();
  // Split the SQL block into individual statements
  const statements = sqlBlock.split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0)
    .map(stmt => stmt + ';');
  
  sqlStatements.push(...statements);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('MedInv Database Setup');
  console.log('=====================');
  console.log('\nChoose an option:');
  console.log('1. Set up local MySQL database');
  console.log('2. Generate SQL for PlanetScale/cloud database');
  console.log('3. Exit');
  
  const answer = await new Promise(resolve => {
    rl.question('\nEnter option (1-3): ', resolve);
  });
  
  switch (answer) {
    case '1':
      await setupLocalDatabase();
      break;
    case '2':
      generateCloudSQL();
      break;
    case '3':
    default:
      console.log('Exiting setup script.');
      process.exit(0);
  }
  
  rl.close();
}

async function setupLocalDatabase() {
  console.log('\nSetting up local MySQL database...');
  
  // Get database credentials
  const host = process.env.DB_HOST || await prompt('Enter database host (default: localhost): ') || 'localhost';
  const user = process.env.DB_USER || await prompt('Enter database user (default: root): ') || 'root';
  const password = process.env.DB_PASSWORD || await prompt('Enter database password: ') || '';
  const database = process.env.DB_NAME || await prompt('Enter database name (default: test2): ') || 'test2';
  
  try {
    // Create connection without database first
    let connection = await mysql.createConnection({
      host,
      user,
      password
    });
    
    // Create database if it doesn't exist
    console.log(`Creating database ${database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database};`);
    
    // Close connection and reconnect with database selected
    await connection.end();
    
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });
    
    console.log('Creating tables and importing schema...');
    
    // Execute each SQL statement
    for (const statement of sqlStatements) {
      try {
        await connection.query(statement);
      } catch (err) {
        console.error(`Error executing SQL: ${statement}`);
        console.error(err.message);
        
        const continueAnyway = await prompt('Continue anyway? (y/n): ');
        if (continueAnyway.toLowerCase() !== 'y') {
          console.log('Setup aborted.');
          process.exit(1);
        }
      }
    }
    
    console.log('\nDatabase setup complete!');
    console.log(`
Configuration for .env.local:
----------------------------
DB_HOST=${host}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${database}
DEPLOYMENT_MODE=local
    `);
    
    await connection.end();
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  }
}

function generateCloudSQL() {
  console.log('\nGenerating SQL for PlanetScale/cloud database...');
  
  // Combine all SQL statements
  const fullSQL = sqlStatements.join('\n\n');
  
  // Write to a file
  const outputPath = path.join(__dirname, '../cloud-db-setup.sql');
  fs.writeFileSync(outputPath, fullSQL);
  
  console.log(`\nSQL has been generated and saved to: ${outputPath}`);
  console.log('\nInstructions for FREE PlanetScale deployment:');
  console.log('1. Create a new database in PlanetScale (be sure to select the "Hobby" free tier)');
  console.log('2. Use the PlanetScale console or CLI to run the generated SQL');
  console.log('3. Create a connection string and update your .env file or Vercel environment variables:');
  console.log(`
Configuration for Vercel:
-----------------------
DEPLOYMENT_MODE=planetscale
DATABASE_URL=mysql://username:password@region.connect.psdb.cloud/database_name?ssl={"rejectUnauthorized":true}

NOTE: Both Vercel and PlanetScale offer free tiers that are sufficient for MedInv.
No credit card is required for deploying this application!
  `);
}

async function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

main().catch(console.error);
