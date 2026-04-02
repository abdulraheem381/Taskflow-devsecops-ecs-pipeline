const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

function createAuthRoutes(controller, authenticate) {
  const router = express.Router();

  router.post("/register", validate(registerSchema), controller.register);
  router.post("/login", validate(loginSchema), controller.login);
  router.get("/me", authenticate, controller.me);

  return router;
}

module.exports = createAuthRoutes;

