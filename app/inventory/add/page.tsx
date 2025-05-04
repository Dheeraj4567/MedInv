import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { AddInventoryForm } from "@/components/add-inventory-form"

export default function AddInventoryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Add Inventory Item" text="Add a new item to inventory." />
      <div className="grid gap-4">
        <AddInventoryForm />
      </div>
    </DashboardShell>
  )
}

