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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Iniciar sesión</h2>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="border p-2 rounded"
        required
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Contraseña"
        className="border p-2 rounded"
        required
      />
      <button type="submit" className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">Iniciar sesión</button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">¡Sesión iniciada correctamente!</div>}
    </form>
  );
} 