import { executeQuery } from "./mysql.js"; // Added .js extension for ESM import
import fs from "fs";
import path from "path";

// Fetches the schema details for up to 5 tables at a time from the connected MySQL database
// and writes the column names and data types to a JSON file.
export async function fetchAndStoreSchema(batchSize: number = 5): Promise<void> {
  // Get all table names
  const tables = await executeQuery<{ table_name: string }[]>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
  );
  if (!tables || tables.length === 0) {
    console.error("No tables found in the database schema.");
    return;
  }

  const result: Record<string, any[]> = {};
  for (let i = 0; i < tables.length; i += batchSize) {
    const batch = tables.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (tbl) => {
        const desc = await executeQuery<any[]>(`DESC \`${tbl.table_name}\``);
        if (!desc) {
          console.error(`Failed to fetch schema for table: ${tbl.table_name}`);
          return;
        }
        result[tbl.table_name] = desc;
      })
    );
  }

  // Write the result to a JSON file
  const filePath = path.join(__dirname, "../context/db-context.json"); // Corrected path
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
}

// Example usage (uncomment to run directly)
// (async () => {
//   await fetchAndStoreSchema();
//   console.log("Schema details have been written to context-db.json");
// })();

// Add a function to fetch schema information for the StaffAccount table
async function fetchStaffAccountSchema() {
  const staffAccountSchema = await executeQuery<any[]>("DESC StaffAccount");
  if (!staffAccountSchema) {
    console.error("Failed to fetch schema for StaffAccount table.");
    return;
  }
  console.log("StaffAccount Schema:", staffAccountSchema);
}

// Removed the call to fetchStaffAccountSchema()
