USE test2;

-- Fix the medicineCategories table issue
ALTER TABLE medicineCategories
ADD COLUMN drug_category_name VARCHAR(255) GENERATED ALWAYS AS (
  (SELECT drug_category_name FROM DrugCategory dc WHERE dc.drug_category_id = medicineCategories.drug_category_id)
) STORED;

-- Alternatively, if the above doesn't work, we can drop the table and recreate it
-- DROP TABLE IF EXISTS medicineCategories;
-- CREATE TABLE medicineCategories (
--   medicine_id INT NOT NULL,
--   drug_category_id INT NOT NULL,
--   drug_category_name VARCHAR(255),
--   PRIMARY KEY (medicine_id, drug_category_id),
--   FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id),
--   FOREIGN KEY (drug_category_id) REFERENCES DrugCategory(drug_category_id)
-- );
-- 
-- -- Insert the data again
-- INSERT INTO medicineCategories (medicine_id, drug_category_id, drug_category_name)
-- SELECT mc.medicine_id, mc.drug_category_id, dc.drug_category_name
-- FROM medicineCategories mc
-- JOIN DrugCategory dc ON mc.drug_category_id = dc.drug_category_id;

-- Check if there are any other missing columns
-- SHOW COLUMNS FROM medicineCategories;
