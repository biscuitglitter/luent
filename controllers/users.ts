import { User, Note } from "../models"
import express from "express";
const usersRouter = express.Router();

usersRouter.get("/api/users", async (request, response) => {
  const users = await User.findAll({
    include: {
      model: Note,
      attributes: { exclude: ["userId"] }, // we don't need userId in this case so we won't retrieve it
    },
  });
  response.json(users);
});

usersRouter.post("/api/users", async (request, response) => {
  try {
    const user = await User.create(request.body);
    response.json(user);
  } catch (error) {
    return response.status(400).json({ error });
  }
});

usersRouter.get("api/users/:id", async (request, response) => {
  const user = await User.findByPk(request.params.id);
  if (user) {
    response.json(user);
  } else {
    response.status(404).end();
  }
});

export { usersRouter };