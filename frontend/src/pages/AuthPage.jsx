import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "alex.chen@taskflow.internal",
    password: "securepass123"
  });
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to complete request.");
    }
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
      <section className="panel relative overflow-hidden p-8 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.25),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(30,41,59,0.94))]" />
        <div className="relative z-10 flex h-full flex-col justify-between text-slate-100">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.28em]">
              Internal Operations System
            </span>
            <div className="max-w-xl space-y-4">
              <h1 className="font-display text-5xl font-bold leading-tight lg:text-6xl">
                TaskFlow keeps engineering execution visible, owned, and moving.
              </h1>
              <p className="text-base text-slate-300 lg:text-lg">
                A portfolio-grade internal task platform built as separate frontend, auth, and task microservices.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["3", "independent services"],
              ["JWT", "secured access control"],
              ["Kanban", "drag-to-update workflow"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="font-display text-3xl font-bold">{value}</p>
                <p className="mt-2 text-sm text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel flex items-center p-8 lg:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex gap-3">
            <button
              className={mode === "login" ? "button-primary flex-1" : "button-secondary flex-1"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "button-primary flex-1" : "button-secondary flex-1"}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <div className="mb-8">
            <p className="font-display text-3xl font-bold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
              Use the shared JWT identity to access the task management service.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label>
                <span className="mb-2 block text-sm font-medium">Name</span>
                <input className="input" name="name" value={form.name} onChange={handleChange} required />
              </label>
            ) : null}

            <label>
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">Password</span>
              <input
                className="input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error ? <p className="text-sm text-rose-500">{error}</p> : null}

            <button className="button-primary w-full" disabled={loading} type="submit">
              {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

