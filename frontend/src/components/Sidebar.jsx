export default function Sidebar({ user, theme, onToggleTheme, onLogout }) {
  const navItems = [
    { label: "Overview", value: "Operations cockpit" },
    { label: "My Queue", value: "Assigned execution lanes" },
    { label: "Delivery", value: "Kanban workflow" }
  ];

  return (
    <aside className="panel flex flex-col gap-6 p-6 lg:min-h-[calc(100vh-3rem)]">
      <div className="space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-white">
          TF
        </div>
        <div>
          <p className="font-display text-2xl font-bold">TaskFlow</p>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Internal task coordination for engineering teams.
          </p>
        </div>
      </div>

      <div className="soft-panel space-y-1 p-3">
        {navItems.map((item) => (
          <div key={item.label} className="rounded-2xl px-3 py-3">
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-xs text-[rgb(var(--text-secondary))]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="soft-panel mt-auto space-y-4 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[rgb(var(--text-secondary))]">Signed in as</p>
          <p className="mt-2 font-semibold">{user?.name}</p>
          <p className="text-sm text-[rgb(var(--text-secondary))]">{user?.email}</p>
        </div>

        <div className="flex gap-3">
          <button className="button-secondary flex-1" onClick={onToggleTheme}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button className="button-primary flex-1" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

