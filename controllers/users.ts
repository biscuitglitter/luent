import { User, Note } from "../models"
import express from "express";
const usersRouter = express.Router();

usersRouter.get("/", async (request, response) => {
  const users = await User.findAll({
    include: {
      model: Note,
      attributes: { exclude: ["userId"] }, 
      // we don't need userId in this case so we won't retrieve it
    },
  });
  response.json(users);
});

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findByPk(request.params.id);
  if (user) {
    response.json(user);
  } else {
    response.status(404).end();
  }
});

export { usersRouter };