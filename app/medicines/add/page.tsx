import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { AddMedicineForm } from "@/components/add-medicine-form"

export default function AddMedicinePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Add Medicine" text="Add a new medicine to the catalog." />
      <div className="grid gap-4">
        <AddMedicineForm />
      </div>
    </DashboardShell>
  )
}

