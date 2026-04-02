const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().allow("").max(2000).default(""),
  status: Joi.string().valid("Todo", "InProgress", "Done").required(),
  priority: Joi.string().valid("Low", "Medium", "High").required(),
  assignee: Joi.string().min(2).max(120).required(),
  dueDate: Joi.string().isoDate().allow(null, "").optional()
});

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

function createTaskRoutes(controller) {
  const router = express.Router();

  router.get("/", controller.getTasks);
  router.get("/:id", validate(idSchema, "params"), controller.getTask);
  router.post("/", validate(taskSchema), controller.createTask);
  router.put("/:id", validate(idSchema, "params"), validate(taskSchema), controller.updateTask);
  router.delete("/:id", validate(idSchema, "params"), controller.deleteTask);

  return router;
}

module.exports = createTaskRoutes;
