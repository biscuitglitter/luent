import "dotenv/config";
import express, { Request, Response, NextFunction, Application, RequestHandler} from "express";
import { PORT } from "./utils/config";
import { connectToDatabase } from "./utils/db";
import cors from "cors";
const app: Application = express();

import { notesRouter } from "./controllers/notes";
import { authRouter } from "./routes/authRoutes";
import { usersRouter } from "./controllers/users";

app.use(express.json() as RequestHandler); //For JSON requests
app.use(express.urlencoded({ extended: true }) as RequestHandler);

app.use(cors({}));

app.set("view engine", "pug");
app.set("views", "./views");

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

app.get("/", (request, response) => {
  response.render("home");
});

const startup = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`PORT: ${PORT}`);
  });
};

startup();

export { app };
