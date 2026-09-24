import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form"
import type { ZodType } from "zod"

interface UseCrudFormOptions<TFormValues extends FieldValues> {
  // Both type args pinned to TFormValues (zod v4's ZodType defaults Input to
  // `unknown` when only one is given, which breaks zodResolver's inference
  // through this generic wrapper).
  schema: ZodType<TFormValues, TFormValues>
  defaultValues: DefaultValues<TFormValues>
}

// RHF + zod glue, oasis's `useCrudForm` equivalent. Deliberately doesn't
// touch toasts/mutation state — CrudSection's mutations own success/error
// feedback, this hook only owns form validation wiring.
export function useCrudForm<TFormValues extends FieldValues>({
  schema,
  defaultValues,
}: UseCrudFormOptions<TFormValues>) {
  return useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
}
