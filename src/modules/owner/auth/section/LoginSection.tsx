import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import type { LoginRequest, LoginResponse } from "@/entities/auth/model/auth.types"
import { LoginForm } from "@/modules/owner/auth/components/LoginForm"
import type { LoginFormValues } from "@/modules/owner/auth/schemas/login.schema"
import { ApiError, NetworkError, apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"
import { useAuthStore } from "@/shared/auth/store"

async function loginWithPassword(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<SingleResponse<LoginResponse>>(
    "/auth/login/password",
    payload
  )
  return response.data.data
}

export function LoginSection() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const mutation = useMutation({
    mutationFn: loginWithPassword,
    onSuccess: (data, variables) => {
      if (data.role !== "owner") {
        toast.error("This app is for owner accounts only.")
        return
      }
      login({ ...data, email: variables.email })
      navigate("/app", { replace: true })
    },
    onError: (error) => {
      if (error instanceof ApiError || error instanceof NetworkError) {
        toast.error(error.message)
      } else {
        toast.error("Login failed")
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <span className="mb-8 text-4xl font-bold tracking-wide text-primary">Neela</span>

        <div className="w-full rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-xl font-bold text-foreground">Masuk sebagai Owner</h1>
            <p className="text-sm text-muted-foreground">
              Kelola toko Anda dari satu dashboard.
            </p>
          </div>
          <LoginForm
            onSubmit={(values: LoginFormValues) => mutation.mutate(values)}
            isSubmitting={mutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
