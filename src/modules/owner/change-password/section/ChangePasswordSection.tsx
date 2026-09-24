import { ChangePasswordForm } from "@/modules/owner/change-password/components/ChangePasswordForm"

// Reached from the header avatar menu, not the sidebar — see OwnerHeader.
export function ChangePasswordSection() {
  return (
    <div className="max-w-xl rounded-[18px] border bg-card px-7 py-6">
      <ChangePasswordForm />
    </div>
  )
}
