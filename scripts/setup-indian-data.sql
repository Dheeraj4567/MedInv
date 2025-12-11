-- MedInv MySQL database creation script with preset Indian data
-- This script creates all the tables and inserts sample data

-- Create and use database
CREATE DATABASE IF NOT EXISTS test2;
USE test2;

-- Create Staff Account table
CREATE TABLE IF NOT EXISTS StaffAccount (
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  employee_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (username)
);

-- Create Patient table
CREATE TABLE IF NOT EXISTS Patient (
  patient_id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (patient_id)
);

-- Create Supplier table
CREATE TABLE IF NOT EXISTS Supplier (
  supplier_id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id)
);

-- Create Employee table
CREATE TABLE IF NOT EXISTS Employee (
  employee_id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (employee_id)
);

-- Create Medicine table
CREATE TABLE IF NOT EXISTS Medicine (
  medicine_id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  unit VARCHAR(50),
  expiry_date DATE,
  manufacturer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (medicine_id)
);

-- Create Inventory table
CREATE TABLE IF NOT EXISTS Inventory (
  inventory_id INT AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  location VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (inventory_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS Orders (
  order_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  supplier_id INT NOT NULL,
  employee_id INT NOT NULL,
  order_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create OrderItems table
CREATE TABLE IF NOT EXISTS OrderItems (
  order_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (order_id, medicine_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create MedicalLogs table
CREATE TABLE IF NOT EXISTS MedicalLogs (
  log_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  medicine_id INT NOT NULL,
  log_date DATE NOT NULL,
  dosage VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Insert preset Indian data

-- Insert staff accounts (passwords stored in plaintext, should be hashed in production)
INSERT INTO Employee (employee_id, name, email, phone_number, role) VALUES
(1, 'Dr. Rahul Sharma', 'rahul.sharma@hospital.com', '9876543210', 'Doctor'),
(2, 'Nurse Priya Patel', 'priya.patel@hospital.com', '8765432109', 'Nurse');

INSERT INTO StaffAccount (username, password, employee_id) VALUES
('admin', 'admin123', 1),
('nurse', 'nurse123', 2);

-- Insert patients with Indian names
INSERT INTO Patient (name, email, phone_number) VALUES
('Rajesh Kumar', 'rajesh.kumar@example.com', '9876543210'),
('Priya Singh', 'priya.singh@example.com', '8765432109'),
('Amit Patel', 'amit.patel@example.com', '7654321098'),
('Sunita Sharma', 'sunita.sharma@example.com', '6543210987'),
('Vikram Mehta', 'vikram.mehta@example.com', '9988776655');

-- Insert suppliers with Indian company names
INSERT INTO Supplier (name, email, phone_number) VALUES
('Bharat Pharmaceuticals', 'contact@bharatpharma.com', '9876543210'),
('Indian Medical Supplies', 'info@indianmedsupplies.com', '8765432109'),
('Arogya Healthcare Products', 'sales@arogyahealthcare.com', '7654321098');

-- Insert medicines (common Indian and generic medicines)
INSERT INTO Medicine (name, description, price, unit, expiry_date, manufacturer) VALUES
('Crocin', 'Paracetamol for pain relief and fever reduction', 25.50, 'strip', '2026-03-15', 'GlaxoSmithKline'),
('Allegra', 'Antihistamine for allergies', 120.75, 'box', '2025-08-20', 'Sanofi India'),
('Dolo 650', 'Paracetamol tablet for fever and pain', 30.00, 'strip', '2026-04-10', 'Micro Labs'),
('Azithral 500', 'Antibiotic for bacterial infections', 85.25, 'strip', '2025-09-05', 'Alembic Pharma'),
('Becosules', 'Vitamin B complex capsules', 73.50, 'bottle', '2025-11-12', 'Pfizer India'),
('Revital H', 'Daily health supplement', 240.00, 'bottle', '2026-02-28', 'Sun Pharma'),
('Digene', 'Antacid for digestive problems', 45.30, 'bottle', '2025-10-15', 'Abbott India'),
('Limcee', 'Vitamin C tablets', 35.00, 'tube', '2025-12-20', 'Abbott India'),
('Evion 400', 'Vitamin E capsules', 70.80, 'bottle', '2026-01-15', 'Merck'),
('Shelcal 500', 'Calcium supplement', 110.00, 'bottle', '2025-07-25', 'Torrent Pharma');

-- Insert inventory data
INSERT INTO Inventory (medicine_id, quantity, location) VALUES
(1, 150, 'Shelf A1'),
(2, 75, 'Shelf B2'),
(3, 200, 'Shelf A2'),
(4, 60, 'Shelf C1'),
(5, 90, 'Shelf B3'),
(6, 40, 'Shelf D1'),
(7, 110, 'Shelf C2'),
(8, 85, 'Shelf B1'),
(9, 55, 'Shelf D2'),
(10, 65, 'Shelf C3');

-- Insert orders
INSERT INTO Orders (patient_id, supplier_id, employee_id, order_date) VALUES
(1, 1, 1, '2025-05-15'),
(2, 2, 2, '2025-05-16'),
(3, 1, 1, '2025-05-17'),
(4, 3, 2, '2025-05-18');

-- Insert order items
INSERT INTO OrderItems (order_id, medicine_id, quantity) VALUES
(1, 1, 2),
(1, 3, 1),
(2, 2, 1),
(2, 5, 1),
(3, 7, 1),
(3, 9, 2),
(4, 4, 1),
(4, 6, 1);

-- Insert medical logs
INSERT INTO MedicalLogs (patient_id, medicine_id, log_date, dosage, notes) VALUES
(1, 1, '2025-05-15', '1 tablet every 6 hours', 'Patient reported headache relief after first dose'),
(2, 2, '2025-05-16', '1 tablet daily', 'For seasonal allergies'),
(3, 7, '2025-05-17', '1 tablespoon after meals', 'For acidity and indigestion'),
(4, 4, '2025-05-18', '1 tablet daily for 5 days', 'For treating respiratory infection'),
(5, 10, '2025-05-19', '1 tablet daily', 'For calcium deficiency');

-- Add indexes for better performance
CREATE INDEX idx_patient_name ON Patient(name);
CREATE INDEX idx_medicine_name ON Medicine(name);
CREATE INDEX idx_medicine_expiry ON Medicine(expiry_date);
CREATE INDEX idx_inventory_medicine ON Inventory(medicine_id);
CREATE INDEX idx_orders_patient ON Orders(patient_id);
CREATE INDEX idx_orders_date ON Orders(order_date);
CREATE INDEX idx_medical_logs_patient ON MedicalLogs(patient_id);
CREATE INDEX idx_medical_logs_date ON MedicalLogs(log_date);
