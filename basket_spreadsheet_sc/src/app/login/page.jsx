"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { checkCredentials, authorizeDevice } from "../utils/auth/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (!(await checkCredentials(username, password))) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }
      await authorizeDevice();
      router.replace("/");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la autorización en este dispositivo.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-black">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ingreso de credenciales
        </h1>

        <input className={input} placeholder="Usuario" autoComplete="username"
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className={input} type="password" placeholder="Contraseña"
          autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {busy ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  )
}