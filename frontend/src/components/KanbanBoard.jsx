import { useDrop, useDrag } from "react-dnd";

const columns = [
  { key: "Todo", label: "Todo", accent: "bg-slate-400" },
  { key: "InProgress", label: "In Progress", accent: "bg-amber-400" },
  { key: "Done", label: "Done", accent: "bg-emerald-400" }
];

function TaskCard({ task, onEdit }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK_CARD",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <button
      ref={drag}
      onClick={() => onEdit(task)}
      className={`soft-panel w-full cursor-move p-4 text-left transition ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-semibold">{task.title}</p>
        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-[rgb(var(--text-secondary))]">{task.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--text-secondary))]">
        <span>{task.assignee}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}</span>
      </div>
    </button>
  );
}

function KanbanColumn({ column, tasks, onMove, onEdit }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK_CARD",
    drop: (item) => {
      if (item.status !== column.key) {
        onMove(item.id, column.key);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div ref={drop} className={`panel min-h-[24rem] p-4 transition ${isOver ? "ring-2 ring-orange-400" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${column.accent}`} />
          <p className="font-display text-lg font-bold">{column.label}</p>
        </div>
        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onMove, onEdit }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => (
        <KanbanColumn
          key={column.key}
          column={column}
          tasks={tasks.filter((task) => task.status === column.key)}
          onMove={onMove}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
