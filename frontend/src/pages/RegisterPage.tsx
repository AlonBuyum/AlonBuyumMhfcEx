import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../lib/validation";
import { register as registerApi } from "../api/auth";
import { extractErrorMessage } from "../api/client";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", name: "", password: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const res = await registerApi(values);
      signIn(res.token, res.user);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <div className="auth-page">
      <Card title="Create your account" className="auth-card">
        <form onSubmit={handleSubmit(onSubmit)} className="form-stack" noValidate>
          {serverError ? <Message severity="error" text={serverError} /> : null}
          <FormField label="Name" htmlFor="name" required error={errors.name}>
            <InputText
              id="name"
              autoComplete="name"
              autoFocus
              {...register("name")}
              invalid={Boolean(errors.name)}
              style={{ width: "100%" }}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" required error={errors.email}>
            <InputText
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              invalid={Boolean(errors.email)}
              style={{ width: "100%" }}
            />
          </FormField>
          <FormField label="Password" htmlFor="password" required error={errors.password}>
            <Password
              inputId="password"
              autoComplete="new-password"
              toggleMask
              {...register("password")}
              invalid={Boolean(errors.password)}
              inputStyle={{ width: "100%" }}
              style={{ width: "100%" }}
            />
          </FormField>
          <Button
            type="submit"
            label="Create account"
            icon="pi pi-user-plus"
            loading={isSubmitting}
            style={{ width: "100%" }}
          />
          <div className="muted" style={{ textAlign: "center" }}>
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
