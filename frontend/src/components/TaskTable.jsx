function badgeTone(priority) {
  if (priority === "High") return "bg-rose-500/15 text-rose-500";
  if (priority === "Medium") return "bg-amber-500/15 text-amber-500";
  return "bg-emerald-500/15 text-emerald-500";
}

export default function TaskTable({ tasks, onEdit, onDelete }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-5">
        <div>
          <p className="font-display text-xl font-bold">Execution list</p>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Current owned tasks sorted by priority and due date.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/5 text-[rgb(var(--text-secondary))] dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium">Assignee</th>
              <th className="px-6 py-4 font-medium">Due</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-[rgb(var(--border))]">
                <td className="px-6 py-4">
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 max-w-md text-xs text-[rgb(var(--text-secondary))]">{task.description}</p>
                </td>
                <td className="px-6 py-4">{task.status}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">{task.assignee}</td>
                <td className="px-6 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="button-secondary px-3 py-2 text-xs" onClick={() => onEdit(task)}>
                      Edit
                    </button>
                    <button className="button-secondary px-3 py-2 text-xs" onClick={() => onDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-[rgb(var(--text-secondary))]" colSpan="6">
                  No tasks yet. Create one to populate the board.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
