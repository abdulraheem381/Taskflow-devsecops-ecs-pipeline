import { useEffect, useState } from "react";

const emptyTask = {
  title: "",
  description: "",
  status: "Todo",
  priority: "Medium",
  assignee: "",
  dueDate: ""
};

export default function TaskFormModal({ isOpen, onClose, onSubmit, initialTask, currentUser }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (initialTask) {
      setForm({
        ...initialTask,
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : ""
      });
    } else {
      setForm({ ...emptyTask, assignee: currentUser?.name || "" });
    }
  }, [initialTask, currentUser]);

  if (!isOpen) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="font-display text-2xl font-bold">
              {initialTask ? "Update task" : "Create task"}
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Capture internal delivery work with ownership and urgency.
            </p>
          </div>
          <button className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Title</span>
            <input className="input" name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Description</span>
            <textarea
              className="input min-h-32"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select className="input" name="status" value={form.status} onChange={handleChange}>
              <option value="Todo">Todo</option>
              <option value="InProgress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Priority</span>
            <select className="input" name="priority" value={form.priority} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Assignee</span>
            <input className="input" name="assignee" value={form.assignee} onChange={handleChange} required />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Due date</span>
            <input className="input" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          </label>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              {initialTask ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
