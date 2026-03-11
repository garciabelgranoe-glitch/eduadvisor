import { cn } from "@/lib/utils";

interface FormStatusProps {
  errorMessage?: string | null;
  successMessage?: string | null;
}

export function FormStatus({ errorMessage, successMessage }: FormStatusProps) {
  return (
    <>
      {errorMessage ? <p className={cn("text-sm text-red-700")}>{errorMessage}</p> : null}
      {successMessage ? <p className={cn("text-sm text-brand-700")}>{successMessage}</p> : null}
    </>
  );
}

