import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define types for the database query results
interface CategoryResult {
  name: string;
  count: number;
  total_quantity: number;
  value: number;
}

interface LocationResult {
  name: string;
  count: number;
  total_quantity: number;
  value: number;
}

interface TotalsResult {
  totalItems: number;
  totalValue: number;
}

interface LowStockResult {
  lowStockCount: number;
}

// This will fetch actual inventory distribution data from the database
async function getInventoryDistributionData() {
  try {
    // Use the medicineCategories table which has the drug_category_name column
    const categoriesQuery = `
      SELECT 
        mc.drug_category_name as name,
        COUNT(DISTINCT mc.medicine_id) as count,
        SUM(i.quantity) as total_quantity,
        SUM(i.quantity * m.price) as value
      FROM medicineCategories mc
      JOIN Medicine m ON mc.medicine_id = m.medicine_id
      LEFT JOIN Inventory i ON m.medicine_id = i.medicine_id
      GROUP BY mc.drug_category_name
      ORDER BY count DESC
    `;
    
    const categories = await executeQuery<CategoryResult[]>(categoriesQuery);
    
    // Get location distribution
    const locationsQuery = `
      SELECT 
        i.location as name, 
        COUNT(DISTINCT i.medicine_id) as count,
        SUM(i.quantity) as total_quantity,
        SUM(i.quantity * m.price) as value
      FROM Inventory i
      JOIN Medicine m ON i.medicine_id = m.medicine_id
      WHERE i.location IS NOT NULL AND i.location != ''
      GROUP BY i.location
      ORDER BY count DESC
    `;
    
    const locations = await executeQuery<LocationResult[]>(locationsQuery);
    
    // Get total items and value - Use COALESCE for price
    const totalsQuery = `
      SELECT 
        SUM(i.quantity) as totalItems,
        SUM(i.quantity * COALESCE(m.price, 0)) as totalValue /* Handle NULL price */
      FROM Inventory i
      JOIN Medicine m ON i.medicine_id = m.medicine_id
    `;
    
    const totals = await executeQuery<TotalsResult[]>(totalsQuery);
    
    // Get low stock count
    const lowStockQuery = `
      SELECT COUNT(*) as lowStockCount
      FROM Inventory i
      JOIN Medicine m ON i.medicine_id = m.medicine_id
      WHERE i.quantity < 10
    `;
    
    const lowStock = await executeQuery<LowStockResult[]>(lowStockQuery);
    
    // Ensure totals are not null/undefined before accessing
    const totalItems = totals?.[0]?.totalItems ?? 0;
    const totalValue = totals?.[0]?.totalValue ?? 0;
    const lowStockCount = lowStock?.[0]?.lowStockCount ?? 0;

    // Process categories data to include percentages
    const processedCategories = categories.map((category) => {
      const percentage = totalItems > 0 ? 
        Math.round((category.total_quantity / totalItems) * 100) : 0;
      
      // For now, we'll set trend to 0 as we don't have historical data
      return {
        name: category.name,
        count: category.count,
        percentage: percentage,
        trend: 0, // Would need historical data to calculate trends
        value: category.value || 0
      };
    });
    
    // Process locations data
    const processedLocations = locations.map((location) => {
      const percentage = totalItems > 0 ? 
        Math.round((location.total_quantity / totalItems) * 100) : 0;
        
      return {
        name: location.name,
        count: location.count,
        percentage: percentage,
        trend: 0, // Would need historical data to calculate trends
        value: location.value || 0
      };
    });
    
    const response = {
      totalItems: Number(totalItems), // Ensure it's a number
      totalValue: Number(totalValue), // Ensure it's a number
      lowStockCount: Number(lowStockCount), // Ensure it's a number
      categories: processedCategories,
      locations: processedLocations
    };
    
    return response;
  } catch (error) {
    console.error("Error getting inventory distribution data:", error);
    // Return default structure on error to prevent frontend crashes
    return {
      categories: [],
      locations: [],
      totals: { totalItems: 0, totalValue: 0 },
      lowStockCount: 0
    };
  }
}

export async function GET() {
  try {
    const data = await getInventoryDistributionData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory distribution data" },
      { status: 500 }
    );
  }
}