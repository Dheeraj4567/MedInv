"use server"

import { revalidatePath } from "next/cache"
import { insert } from "@/lib/mysql"

// This function will be called from client components to log SQL commands
export async function logSQLCommand(command: {
  command: string
  table: string
  status: "success" | "error"
  error?: string
}) {
  // In a real app, you might want to log these to a database table
  console.log(`SQL Command: ${command.command}`)
  return command
}

// Example of a server action that performs a database operation
export async function addMedicine(formData: FormData) {
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const manufacturer = formData.get("manufacturer") as string
  const price = formData.get("price") as string
  const expiryDate = formData.get("expiryDate") as string

  try {
    const data = await insert("medicine", {
      name,
      category,
      manufacturer,
      price: Number.parseFloat(price),
      expiry_date: expiryDate,
      in_stock: true,
    })

    revalidatePath("/medicines")
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to add medicine",
    }
  }
}

export async function addInventoryItem(formData: FormData) {
  const medicineId = formData.get("medicineId") as string
  const quantity = Number.parseInt(formData.get("quantity") as string)
  const supplierId = formData.get("supplierId") as string
  const batchNumber = formData.get("batchNumber") as string

  try {
    const data = await insert("inventory", {
      medicine_id: medicineId,
      quantity,
      supplier_id: supplierId,
      batch_number: batchNumber,
      status: quantity > 0 ? "In Stock" : "Out of Stock",
    })

    revalidatePath("/inventory")
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to add inventory item",
    }
  }
}

// Add more server actions for other tables as needed

