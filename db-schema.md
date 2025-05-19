# MedInv Database Schema

This file contains the SQL schema for the MedInv application database. Use this to set up your database whether in a local environment or a cloud provider like PlanetScale.

## Core Tables

```sql
-- Patient table for storing patient information
CREATE TABLE Patient (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Supplier table for storing supplier information
CREATE TABLE Supplier (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employee table for storing employee information
CREATE TABLE Employee (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medicine table for storing medicine information
CREATE TABLE Medicine (
  medicine_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  unit VARCHAR(50),
  expiry_date DATE,
  manufacturer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory table for storing inventory information
CREATE TABLE Inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  location VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
);

-- Orders table for storing order information
CREATE TABLE Orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  supplier_id INT NOT NULL,
  employee_id INT NOT NULL,
  order_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- OrderItems table for storing order items
CREATE TABLE OrderItems (
  order_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (order_id, medicine_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
);

-- MedicalLogs table for storing medical logs
CREATE TABLE MedicalLogs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medicine_id INT NOT NULL,
  log_date DATE NOT NULL,
  dosage VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
);
```

## Initial Data for Testing

You can use these SQL statements to add some initial data for testing:

```sql
-- Insert test patients
INSERT INTO Patient (name, email, phone_number) VALUES 
('John Doe', 'john.doe@example.com', '1234567890'),
('Jane Smith', 'jane.smith@example.com', '9876543210'),
('Rajesh Kumar', 'rajesh@example.com', '9876543210');

-- Insert test suppliers
INSERT INTO Supplier (name, email, phone_number) VALUES 
('MediSupply Inc.', 'contact@medisupply.com', '1122334455'),
('PharmaWholesale', 'info@pharmawholesale.com', '5566778899');

-- Insert test employees
INSERT INTO Employee (name, email, phone_number, role) VALUES 
('Dr. Mike Johnson', 'mike.johnson@hospital.com', '1231231234', 'Doctor'),
('Nurse Sarah Williams', 'sarah.williams@hospital.com', '4564564567', 'Nurse');

-- Insert test medicines
INSERT INTO Medicine (name, description, price, unit, expiry_date, manufacturer) VALUES 
('Paracetamol', 'Pain reliever and fever reducer', 9.99, 'bottle', '2025-12-31', 'MediCorp'),
('Amoxicillin', 'Antibiotic medication', 19.99, 'pack', '2025-06-30', 'PharmaCorp'),
('Loratadine', 'Antihistamine for allergies', 15.50, 'box', '2026-01-15', 'AllergyMeds Inc.');

-- Insert test inventory
INSERT INTO Inventory (medicine_id, quantity, location) VALUES 
(1, 100, 'Shelf A1'),
(2, 50, 'Shelf B2'),
(3, 75, 'Shelf C3');

-- Insert test medical logs
INSERT INTO MedicalLogs (patient_id, medicine_id, log_date, dosage, notes) VALUES 
(1, 1, '2025-01-15', '1 tablet every 6 hours', 'Patient reported headache relief after first dose'),
(2, 2, '2025-01-16', '1 capsule twice daily', 'Treating respiratory infection');
```
