import { User, Note } from "../models";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import express, { Request, Response, NextFunction } from "express";
const notesRouter = express.Router();

export interface tokenRequest extends Request {
  decodedToken?: any;
}

type where = {
  important?: boolean;
  content?: any;
};

notesRouter.get("/api/notes", async (request, response) => {
  const where: where = {};

  if (request.query.important) {
    where.important = request.query.important === "true";
  }

  if (request.query.search) {
    where.content = {
      [Op.substring]: request.query.search,
    };
  }

  const notes = await Note.findAll({
    // sequelize query findAll()
    attributes: { exclude: ["userId"] }, // we're not retrieving the user ids
    include: {
      model: User, // we specify the model of what we want to retrieve (that is associated with notes)
      attributes: ["name"], // we retrieve the name of each user associated with a note
    },
    where, // if the query has a where request, it will utilize it otherwise, it won't be called at all
  });
  response.json(notes); // get notes in json format as a response
});

const tokenExtractor = (
  req: tokenRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    console.log(authorization);
    try {
      req.decodedToken = jwt.verify(
        authorization.substring(7),
        process.env.SECRET!
      );
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

notesRouter.post(
  "/api/notes",
  tokenExtractor,
  async (req: tokenRequest, res: Response) => {
    try {
      const user = await User.findByPk(req.decodedToken.id);
      const note = await Note.create({
        ...req.body,
        userId: user?.id,
        date: new Date(),
      });
      res.json(note);
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
);

notesRouter.get("/api/notes/:id", async (request, response) => {
  const note = await Note.findByPk(request.params.id);
  // sequelize query that looks for primary key (id is the defined primary key in the note model)
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

notesRouter.delete("/api/notes/:id", async (request, response) => {
  const note = await Note.findByPk(request.params.id);
  if (note) {
    await note.destroy();
  }
  response.status(204).end();
});

notesRouter.put("api/notes/:id", async (request, response) => {
  const note = await Note.findByPk(request.params.id);
  if (note) {
    note.important = request.body.important;
    await note.save();
    response.json(note);
  } else {
    response.status(404).end();
  }
});

export { notesRouter };