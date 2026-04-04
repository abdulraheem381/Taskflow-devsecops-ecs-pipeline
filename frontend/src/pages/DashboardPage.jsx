import { useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import TaskFormModal from "../components/TaskFormModal";
import TaskTable from "../components/TaskTable";
import { useAuth } from "../context/AuthContext";
import { tasksApi } from "../services/api";

function metricCards(tasks) {
  return [
    { label: "Open tasks", value: tasks.filter((task) => task.status !== "Done").length },
    { label: "High priority", value: tasks.filter((task) => task.priority === "High").length },
    { label: "Completed", value: tasks.filter((task) => task.status === "Done").length }
  ];
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("taskflow-theme") || "light");
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");
  const cards = useMemo(() => metricCards(tasks), [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("taskflow-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setError("");
      const { data } = await tasksApi.get("");
      setTasks(data.tasks);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to fetch tasks.");
    }
  }

  async function handleSubmit(task) {
    try {
      if (editingTask) {
        const { data } = await tasksApi.put(`${editingTask.id}`, task);
        setTasks((current) => current.map((item) => (item.id === editingTask.id ? data.task : item)));
      } else {
        const { data } = await tasksApi.post("", task);
        setTasks((current) => [data.task, ...current]);
      }

      setModalOpen(false);
      setEditingTask(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save task.");
    }
  }

  async function handleDelete(taskId) {
    try {
      await tasksApi.delete(`${taskId}`);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete task.");
    }
  }

  async function handleMove(taskId, status) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      return;
    }

    const nextTask = { ...currentTask, status };
    setTasks((current) => current.map((task) => (task.id === taskId ? nextTask : task)));

    try {
      const { data } = await tasksApi.put(`${taskId}`, nextTask);
      setTasks((current) => current.map((task) => (task.id === taskId ? data.task : task)));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to move task.");
      fetchTasks();
    }
  }

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6">
        <Sidebar
          user={user}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          onLogout={logout}
        />

        <main className="space-y-6">
          <section className="panel overflow-hidden p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Internal Dashboard
                </span>
                <div>
                  <h1 className="font-display text-4xl font-bold">Delivery cockpit</h1>
                  <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-secondary))]">
                    Manage individual work items across Todo, In Progress, and Done with owner-scoped access.
                  </p>
                </div>
              </div>

              <button className="button-primary" onClick={openCreateModal}>
                New task
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {cards.map((card) => (
                <div key={card.label} className="soft-panel p-5">
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{card.label}</p>
                  <p className="mt-3 font-display text-4xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </section>

          {error ? (
            <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
              {error}
            </section>
          ) : null}

          <KanbanBoard tasks={tasks} onMove={handleMove} onEdit={openEditModal} />
          <TaskTable tasks={tasks} onEdit={openEditModal} onDelete={handleDelete} />
        </main>

        <TaskFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleSubmit}
          initialTask={editingTask}
          currentUser={user}
        />
      </div>
    </DndProvider>
  );
}
