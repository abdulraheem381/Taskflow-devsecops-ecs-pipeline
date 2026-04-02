function mapTask(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function createTasksController({ db }) {
  const listTasksStmt = db.prepare(`
    SELECT *
    FROM tasks
    WHERE user_id = ?
    ORDER BY
      CASE priority
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        ELSE 3
      END,
      COALESCE(due_date, '9999-12-31') ASC,
      updated_at DESC
  `);
  const insertTaskStmt = db.prepare(`
    INSERT INTO tasks (user_id, title, description, status, priority, assignee, due_date)
    VALUES (@user_id, @title, @description, @status, @priority, @assignee, @due_date)
  `);
  const findTaskStmt = db.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
  const updateTaskStmt = db.prepare(`
    UPDATE tasks
    SET
      title = @title,
      description = @description,
      status = @status,
      priority = @priority,
      assignee = @assignee,
      due_date = @due_date,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id AND user_id = @user_id
  `);
  const deleteTaskStmt = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");

  return {
    getTasks(req, res) {
      const tasks = listTasksStmt.all(req.user.id).map(mapTask);
      return res.json({ tasks });
    },

    getTask(req, res) {
      const task = findTaskStmt.get(req.params.id, req.user.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.json({ task: mapTask(task) });
    },

    createTask(req, res) {
      const result = insertTaskStmt.run({
        user_id: req.user.id,
        title: req.body.title,
        description: req.body.description || "",
        status: req.body.status,
        priority: req.body.priority,
        assignee: req.body.assignee,
        due_date: req.body.dueDate || null
      });

      const task = findTaskStmt.get(result.lastInsertRowid, req.user.id);
      return res.status(201).json({ task: mapTask(task) });
    },

    updateTask(req, res) {
      const existingTask = findTaskStmt.get(req.params.id, req.user.id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      updateTaskStmt.run({
        id: Number(req.params.id),
        user_id: req.user.id,
        title: req.body.title,
        description: req.body.description || "",
        status: req.body.status,
        priority: req.body.priority,
        assignee: req.body.assignee,
        due_date: req.body.dueDate || null
      });

      const updatedTask = findTaskStmt.get(req.params.id, req.user.id);
      return res.json({ task: mapTask(updatedTask) });
    },

    deleteTask(req, res) {
      const result = deleteTaskStmt.run(req.params.id, req.user.id);
      if (!result.changes) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(204).send();
    }
  };
}

module.exports = createTasksController;
