import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import { ProgressSpinner } from "primereact/progressspinner";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LoginPage = lazy(() =>
	import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
	import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() =>
	import("./pages/DashboardPage").then((m) => ({
		default: m.DashboardPage,
	})),
);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

function FullPageSpinner() {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<ProgressSpinner />
		</div>
	);
}

export function App() {
	return (
		<PrimeReactProvider value={{ ripple: true }}>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<BrowserRouter>
						<Suspense fallback={<FullPageSpinner />}>
							<Routes>
								<Route path="/login" element={<LoginPage />} />
								<Route path="/register" element={<RegisterPage />} />
								<Route
									path="/"
									element={
										<ProtectedRoute>
											<DashboardPage />
										</ProtectedRoute>
									}
								/>
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</Suspense>
					</BrowserRouter>
				</AuthProvider>
			</QueryClientProvider>
		</PrimeReactProvider>
	);
}
