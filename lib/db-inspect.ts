import { executeQuery } from "@/lib/mysql";

/**
 * Utility to fetch schema details for up to 5 tables at a time from the connected MySQL database.
 * Usage: Import and call getTableDescriptions().
 */

export async function getTableDescriptions(batchSize: number = 5): Promise<Record<string, any[]>> {
  // Get all table names
  const tables = await executeQuery<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()`
  );
  if (!tables || tables.length === 0) return {};

  const result: Record<string, any[]> = {};
  for (let i = 0; i < tables.length; i += batchSize) {
    const batch = tables.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (tbl) => {
        const desc = await executeQuery<any[]>(`DESC \`${tbl.table_name}\``);
        result[tbl.table_name] = desc || [];
      })
    );
  }
  return result;
}

// Example usage (uncomment to run directly)
// (async () => {
//   const schema = await getTableDescriptions();
//   console.log(JSON.stringify(schema, null, 2));
// })();