import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";

export default function LoginForm() {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		try {
			await login(email);
			setSuccess(true);
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-8 p-8 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/20">
			<h2 className="text-2xl font-black mb-4 text-center tracking-tight text-gray-900">Iniciar sesión</h2>
			<input
				value={email}
				onChange={e => setEmail(e.target.value)}
				placeholder="Email"
				type="email"
				className="border-primary/10 bg-white/50 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
				required
			/>
			<input
				value={password}
				onChange={e => setPassword(e.target.value)}
				type="password"
				placeholder="Contraseña"
				className="border-primary/10 bg-white/50 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
				required
			/>
			<button type="submit" className="bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-all font-black uppercase tracking-widest shadow-lg shadow-primary/10">Iniciar sesión</button>
			{error && <div className="text-destructive text-sm font-medium bg-destructive/5 p-3 rounded-lg border border-destructive/10 text-center">{error}</div>}
			{success && <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100 text-center">¡Sesión iniciada correctamente!</div>}
		</form>
	);
} 