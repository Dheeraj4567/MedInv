USE test2;

-- Drop the existing medicineCategories table
DROP TABLE IF EXISTS medicineCategories;

-- Recreate the medicineCategories table with the drug_category_name column
CREATE TABLE medicineCategories (
  medicine_id INT NOT NULL,
  drug_category_id INT NOT NULL,
  drug_category_name VARCHAR(255),
  PRIMARY KEY (medicine_id, drug_category_id),
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id),
  FOREIGN KEY (drug_category_id) REFERENCES DrugCategory(drug_category_id)
);

-- Insert the data again with drug_category_name
INSERT INTO medicineCategories (medicine_id, drug_category_id, drug_category_name)
SELECT mc_old.medicine_id, mc_old.drug_category_id, dc.drug_category_name
FROM (
  SELECT 1 as medicine_id, 1 as drug_category_id UNION ALL
  SELECT 2, 3 UNION ALL
  SELECT 3, 1 UNION ALL
  SELECT 4, 2 UNION ALL
  SELECT 5, 5 UNION ALL
  SELECT 6, 5 UNION ALL
  SELECT 7, 4 UNION ALL
  SELECT 8, 5 UNION ALL
  SELECT 9, 5 UNION ALL
  SELECT 10, 5
) as mc_old
JOIN DrugCategory dc ON mc_old.drug_category_id = dc.drug_category_id;
