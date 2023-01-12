import { Note } from "../models/note";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import express from "express";
const loginRouter = express.Router();

loginRouter.post("/api/login", async (request, response) => {
  const body = request.body;
  const user = await User.findOne({
    where: {
      username: body.username || null,
    },
  });

  const passwordCorrect = body.password === "pass";
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }
  const userForToken = {
    username: user.username,
    id: user.id,
  };
  const token = jwt.sign(userForToken, process.env.SECRET!);
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

export { loginRouter };