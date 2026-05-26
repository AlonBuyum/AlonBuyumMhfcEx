import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "../lib/validation";
import { login } from "../api/auth";
import { extractErrorMessage } from "../api/client";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { signIn } = useAuth();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = async (values: LoginFormValues) => {
		setServerError(null);
		try {
			const res = await login(values);
			signIn(res.token, res.user);
			const redirectTo =
				(location.state as { from?: string } | null)?.from ?? "/";
			navigate(redirectTo, { replace: true });
		} catch (err) {
			setServerError(extractErrorMessage(err));
		}
	};

	return (
		<div className="auth-page">
			<Card title="Sign in" className="auth-card">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="form-stack"
					noValidate
				>
					{serverError ? <Message severity="error" text={serverError} /> : null}
					<FormField
						label="Email"
						htmlFor="email"
						required
						error={errors.email}
					>
						<InputText
							id="email"
							type="email"
							autoComplete="email"
							autoFocus
							{...register("email")}
							invalid={Boolean(errors.email)}
							style={{ width: "100%" }}
						/>
					</FormField>
					<FormField
						label="Password"
						htmlFor="password"
						required
						error={errors.password}
					>
						<Controller
							name="password"
							control={control}
							render={({ field, fieldState }) => (
								<Password
									id={field.name}
									inputId="password"
									inputRef={field.ref}
									autoComplete="current-password"
									toggleMask
									feedback={false}
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
									onBlur={field.onBlur}
									invalid={Boolean(fieldState.error)}
									inputStyle={{ width: "100%" }}
									style={{ width: "100%" }}
								/>
							)}
						/>
					</FormField>
					<Button
						type="submit"
						label="Sign in"
						icon="pi pi-sign-in"
						loading={isSubmitting}
						style={{ width: "100%" }}
					/>
					<div className="muted" style={{ textAlign: "center" }}>
						Don't have an account? <Link to="/register">Create one</Link>
					</div>
				</form>
			</Card>
		</div>
	);
}
