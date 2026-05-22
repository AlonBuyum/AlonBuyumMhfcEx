import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";

interface Props {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: FieldError;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, error, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required ? <span className="required-asterisk" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error?.message ? <div className="field-error">{error.message}</div> : null}
    </div>
  );
}
