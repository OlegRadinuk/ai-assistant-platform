import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/auth"
import { getUserById, getAssistantsByOwner } from "@/lib/db"
import DashboardShell from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const user = getUserById(userId)
  const userEmail = user?.email ?? ""
  const assistants = getAssistantsByOwner(userId)

  return (
    <DashboardShell userEmail={userEmail} hasAssistants={assistants.length > 0}>
      {children}
    </DashboardShell>
  )
}
