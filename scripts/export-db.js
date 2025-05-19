#!/usr/bin/env node

/**
 * MedInv Database Export Script
 * 
 * This script helps export your existing database schema and data for migration to PlanetScale
 * or other cloud database providers compatible with Vercel deployment.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('MedInv Database Export Tool');
  console.log('==========================');
  
  const dbHost = process.env.DB_HOST || await prompt('Database host (default: localhost): ') || 'localhost';
  const dbUser = process.env.DB_USER || await prompt('Database user (default: root): ') || 'root';
  const dbPassword = process.env.DB_PASSWORD || await prompt('Database password: ') || '';
  const dbName = process.env.DB_NAME || await prompt('Database name (default: test2): ') || 'test2';
  
  console.log('\nExporting database schema and data...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, '../db-export');
  
  // Create export directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const schemaFile = path.join(outputDir, `${dbName}-schema-${timestamp}.sql`);
  const dataFile = path.join(outputDir, `${dbName}-data-${timestamp}.sql`);
  
  try {
    // Export schema
    console.log('Exporting schema...');
    await runMySQLDump(dbHost, dbUser, dbPassword, dbName, schemaFile, true, false);
    
    // Export data
    console.log('Exporting data...');
    await runMySQLDump(dbHost, dbUser, dbPassword, dbName, dataFile, false, true);
    
    console.log('\nExport complete!');
    console.log(`Schema exported to: ${schemaFile}`);
    console.log(`Data exported to: ${dataFile}`);
    
    console.log('\nVercel Deployment Instructions:');
    console.log('1. Create a database in PlanetScale or other MySQL provider');
    console.log('2. Import the schema file using their console or CLI tools');
    console.log('3. Import the data file using their console or CLI tools');
    console.log('4. Configure environment variables in Vercel:');
    console.log('   - DEPLOYMENT_MODE=planetscale');
    console.log('   - DATABASE_URL=your_connection_string');
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
  
  rl.close();
}

async function runMySQLDump(host, user, password, database, outputFile, schemaOnly, dataOnly) {
  return new Promise((resolve, reject) => {
    const args = [
      `-h${host}`,
      `-u${user}`
    ];
    
    if (password) {
      args.push(`-p${password}`);
    }
    
    if (schemaOnly) {
      args.push('--no-data');
    }
    
    if (dataOnly) {
      args.push('--no-create-info');
    }
    
    args.push(
      '--result-file=' + outputFile,
      '--set-charset',
      database
    );
    
    const mysqldump = spawn('mysqldump', args);
    
    mysqldump.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    
    mysqldump.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    mysqldump.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`mysqldump exited with code ${code}`));
      }
    });
    
    mysqldump.on('error', (err) => {
      reject(new Error(`Failed to start mysqldump: ${err.message}`));
    });
  });
}

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

main().catch(console.error);
