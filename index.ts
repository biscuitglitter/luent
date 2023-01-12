import "dotenv/config";
import express, { Application, RequestHandler } from "express";
import { PORT } from "./utils/config";
import { connectToDatabase } from "./utils/db";
const app: Application = express();

import { notesRouter } from "./controllers/notes";
import { loginRouter } from "./controllers/login";
import { usersRouter } from "./controllers/users";

app.use(express.json() as RequestHandler);

app.get("/", async (request, response) => {
  response.send(`hi`);
});

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

const startup = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`PORT: ${PORT}`);
  });
};

startup();

export { app };