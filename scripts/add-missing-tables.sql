-- Add missing tables to test2 database
USE test2;

-- Create ActivityLog table
CREATE TABLE IF NOT EXISTS ActivityLog (
  id INT AUTO_INCREMENT,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  type VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Create DrugCategory table
CREATE TABLE IF NOT EXISTS DrugCategory (
  drug_category_id INT AUTO_INCREMENT,
  drug_category_name VARCHAR(255) NOT NULL,
  common_uses TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (drug_category_id)
);

-- Create medicineCategories table (mapping table between Medicine and DrugCategory)
CREATE TABLE IF NOT EXISTS medicineCategories (
  medicine_id INT NOT NULL,
  drug_category_id INT NOT NULL,
  PRIMARY KEY (medicine_id, drug_category_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id),
  FOREIGN KEY (drug_category_id) REFERENCES DrugCategory(drug_category_id)
);

-- Create EmployeeAccounts table (if different from StaffAccount)
CREATE TABLE IF NOT EXISTS EmployeeAccounts (
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  employee_id INT NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (username),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Prescription table
CREATE TABLE IF NOT EXISTS Prescription (
  prescription_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  employee_id INT NOT NULL,
  prescription_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (prescription_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create PrescriptionItem table
CREATE TABLE IF NOT EXISTS PrescriptionItem (
  prescription_id INT NOT NULL,
  medicine_id INT NOT NULL,
  dosage VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  instructions TEXT,
  PRIMARY KEY (prescription_id, medicine_id),
  FOREIGN KEY (prescription_id) REFERENCES Prescription(prescription_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create Billing table
CREATE TABLE IF NOT EXISTS Billing (
  billing_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  billing_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (billing_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
);

-- Create BillingItem table
CREATE TABLE IF NOT EXISTS BillingItem (
  billing_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (billing_id, medicine_id),
  FOREIGN KEY (billing_id) REFERENCES Billing(billing_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create Discount table
CREATE TABLE IF NOT EXISTS Discount (
  discount_id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percent DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (discount_id)
);

-- Create ExpiryAlert table
CREATE TABLE IF NOT EXISTS ExpiryAlert (
  alert_id INT AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  expiry_date DATE NOT NULL,
  alert_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (alert_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create Feedback table
CREATE TABLE IF NOT EXISTS Feedback (
  feedback_id INT AUTO_INCREMENT,
  patient_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rating INT,
  feedback_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (feedback_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
);

-- Create MedicalLog table (if different from MedicalLogs)
CREATE TABLE IF NOT EXISTS MedicalLog (
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

-- Create PatientMedication table
CREATE TABLE IF NOT EXISTS PatientMedication (
  medication_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  medicine_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  dosage VARCHAR(255) NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (medication_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create PatientAppointment table
CREATE TABLE IF NOT EXISTS PatientAppointment (
  appointment_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  employee_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  purpose VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (appointment_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create InventoryLog table
CREATE TABLE IF NOT EXISTS InventoryLog (
  log_id INT AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  quantity_change INT NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'add', 'remove', 'adjust'
  reference_id INT, -- Can refer to order_id or other relevant reference
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Create Settings table
CREATE TABLE IF NOT EXISTS Settings (
  setting_id INT AUTO_INCREMENT,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_id),
  UNIQUE KEY (setting_key)
);

-- Create AnalyticsData table
CREATE TABLE IF NOT EXISTS AnalyticsData (
  data_id INT AUTO_INCREMENT,
  data_type VARCHAR(50) NOT NULL,
  data_value TEXT NOT NULL,
  time_period VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (data_id)
);

-- Create Order table (if different than Orders)
CREATE TABLE IF NOT EXISTS `Order` (
  order_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  supplier_id INT NOT NULL,
  employee_id INT NOT NULL,
  order_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create OrderItem table (if different than OrderItems)
CREATE TABLE IF NOT EXISTS OrderItem (
  order_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, medicine_id),
  FOREIGN KEY (order_id) REFERENCES `Order`(order_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- Insert sample data into the new tables

-- Insert drug categories
INSERT INTO DrugCategory (drug_category_name, common_uses) VALUES
('Analgesics', 'Pain relief medications'),
('Antibiotics', 'Treating bacterial infections'),
('Antihistamines', 'Treatment of allergies'),
('Antacids', 'Relief from acidity and indigestion'),
('Vitamins', 'Nutritional supplements');

-- Link medicines to categories
INSERT INTO medicineCategories (medicine_id, drug_category_id) VALUES
(1, 1), -- Crocin is an analgesic
(2, 3), -- Allegra is an antihistamine
(3, 1), -- Dolo 650 is an analgesic
(4, 2), -- Azithral 500 is an antibiotic
(5, 5), -- Becosules are vitamins
(6, 5), -- Revital H is a vitamin supplement
(7, 4), -- Digene is an antacid
(8, 5), -- Limcee is a vitamin (C)
(9, 5), -- Evion 400 is a vitamin (E)
(10, 5); -- Shelcal 500 is a calcium supplement

-- Insert activity logs
INSERT INTO ActivityLog (action, details, type, timestamp) VALUES
('Login', 'User admin logged in', 'auth', '2025-05-15 09:30:00'),
('Add Medicine', 'Added new medicine: Dolo 650', 'inventory', '2025-05-15 10:15:00'),
('Update Inventory', 'Updated quantity for Crocin: +50', 'inventory', '2025-05-16 11:00:00'),
('New Order', 'Created order #1 for patient Rajesh Kumar', 'order', '2025-05-17 14:30:00'),
('New Patient', 'Registered new patient: Vikram Mehta', 'patient', '2025-05-18 16:45:00'),
('Logout', 'User admin logged out', 'auth', '2025-05-18 18:00:00'),
('Login', 'User nurse logged in', 'auth', '2025-05-19 08:45:00'),
('Update Patient', 'Updated contact details for patient Priya Singh', 'patient', '2025-05-19 10:30:00'),
('New Prescription', 'Created prescription for patient Amit Patel', 'prescription', '2025-05-19 11:15:00'),
('Logout', 'User nurse logged out', 'auth', '2025-05-19 17:30:00');

-- Insert employee accounts (sync with StaffAccount)
INSERT INTO EmployeeAccounts (username, password, employee_id, role) 
SELECT username, password, employee_id, 
       CASE 
         WHEN employee_id = 1 THEN 'admin'
         WHEN employee_id = 2 THEN 'nurse'
         ELSE 'staff'
       END as role
FROM StaffAccount;

-- Insert prescriptions
INSERT INTO Prescription (patient_id, employee_id, prescription_date, notes) VALUES
(1, 1, '2025-05-15', 'For fever and headache'),
(2, 1, '2025-05-16', 'For seasonal allergies'),
(3, 2, '2025-05-17', 'For digestive issues'),
(4, 1, '2025-05-18', 'For respiratory infection');

-- Insert prescription items
INSERT INTO PrescriptionItem (prescription_id, medicine_id, dosage, quantity, instructions) VALUES
(1, 1, '1 tablet', 10, 'Take one tablet every 6 hours as needed for pain'),
(1, 3, '1 tablet', 5, 'Take one tablet at night if fever persists'),
(2, 2, '1 tablet', 15, 'Take one tablet daily in the morning'),
(3, 7, '1 tablespoon', 1, 'Take after meals for relief from acidity'),
(4, 4, '1 tablet', 5, 'Take one tablet daily after breakfast for 5 days');

-- Insert billing data
INSERT INTO Billing (patient_id, billing_date, total_amount, payment_status, payment_method) VALUES
(1, '2025-05-15', 125.50, 'Paid', 'Cash'),
(2, '2025-05-16', 120.75, 'Paid', 'Card'),
(3, '2025-05-17', 45.30, 'Pending', NULL),
(4, '2025-05-18', 85.25, 'Paid', 'UPI');

-- Insert billing items
INSERT INTO BillingItem (billing_id, medicine_id, quantity, price_per_unit, discount_amount) VALUES
(1, 1, 2, 25.50, 0),
(1, 3, 1, 30.00, 0),
(2, 2, 1, 120.75, 0),
(3, 7, 1, 45.30, 0),
(4, 4, 1, 85.25, 0);

-- Insert discounts
INSERT INTO Discount (name, description, discount_percent, start_date, end_date, active) VALUES
('Summer Sale', '10% discount on all medicines', 10.00, '2025-05-01', '2025-05-31', TRUE),
('Senior Citizen', '15% discount for senior citizens', 15.00, '2025-01-01', '2025-12-31', TRUE),
('First Purchase', '5% discount on first purchase', 5.00, '2025-01-01', '2025-12-31', TRUE);

-- Insert expiry alerts
INSERT INTO ExpiryAlert (medicine_id, expiry_date, alert_date, status) VALUES
(1, '2026-03-15', '2026-02-15', 'Active'),
(2, '2025-08-20', '2025-07-20', 'Active'),
(3, '2026-04-10', '2026-03-10', 'Active'),
(4, '2025-09-05', '2025-08-05', 'Active');

-- Insert feedback
INSERT INTO Feedback (patient_id, title, description, rating, feedback_date) VALUES
(1, 'Great Service', 'Very satisfied with the service and staff behavior', 5, '2025-05-16'),
(2, 'Average Experience', 'Waited too long, but staff was courteous', 3, '2025-05-17'),
(4, 'Good Consultation', 'Doctor gave proper attention and prescribed effective medicines', 4, '2025-05-19');

-- Insert medical logs (similar to MedicalLogs)
INSERT INTO MedicalLog
SELECT * FROM MedicalLogs;

-- Insert patient medications
INSERT INTO PatientMedication (patient_id, medicine_id, start_date, end_date, dosage, instructions) VALUES
(1, 1, '2025-05-15', '2025-05-20', '1 tablet every 6 hours', 'Take after meals'),
(2, 2, '2025-05-16', '2025-06-16', '1 tablet daily', 'Take in the morning'),
(3, 7, '2025-05-17', '2025-05-24', '1 tablespoon after meals', 'Take when experiencing acidity'),
(4, 4, '2025-05-18', '2025-05-23', '1 tablet daily', 'Take after breakfast');

-- Insert patient appointments
INSERT INTO PatientAppointment (patient_id, employee_id, appointment_date, appointment_time, purpose, status) VALUES
(1, 1, '2025-05-20', '10:00:00', 'Follow-up for fever', 'Scheduled'),
(2, 1, '2025-05-22', '11:30:00', 'Allergy consultation', 'Scheduled'),
(3, 2, '2025-05-21', '14:00:00', 'Digestive issues follow-up', 'Scheduled'),
(5, 1, '2025-05-23', '09:30:00', 'General check-up', 'Scheduled');

-- Insert inventory logs
INSERT INTO InventoryLog (medicine_id, quantity_change, action_type, reference_id, notes) VALUES
(1, 200, 'add', NULL, 'Initial stock'),
(1, -2, 'remove', 1, 'Order #1'),
(2, 100, 'add', NULL, 'Initial stock'),
(2, -1, 'remove', 2, 'Order #2'),
(3, 250, 'add', NULL, 'Initial stock'),
(3, -1, 'remove', 1, 'Order #1'),
(4, 100, 'add', NULL, 'Initial stock'),
(4, -1, 'remove', 4, 'Order #4');

-- Insert settings
INSERT INTO Settings (setting_key, setting_value, description) VALUES
('system_name', 'MedInv', 'Name of the system'),
('currency', 'INR', 'Default currency for billing'),
('low_stock_threshold', '20', 'Threshold for low stock alerts'),
('expiry_alert_days', '30', 'Days before expiry to trigger alerts');

-- Insert analytics data
INSERT INTO AnalyticsData (data_type, data_value, time_period, start_date, end_date) VALUES
('sales', '{"total": 376.8, "categories": {"Analgesics": 170.5, "Antibiotics": 85.25, "Antihistamines": 120.75, "Antacids": 45.30, "Vitamins": 0}}', 'monthly', '2025-05-01', '2025-05-31'),
('inventory', '{"total_items": 930, "categories": {"Analgesics": 350, "Antibiotics": 60, "Antihistamines": 75, "Antacids": 110, "Vitamins": 335}}', 'current', '2025-05-24', '2025-05-24'),
('patients', '{"total": 5, "new": 2, "returning": 3}', 'monthly', '2025-05-01', '2025-05-31');
