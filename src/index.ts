import pg from "pg";
import bodyParser from "body-parser";
import { Sequelize, QueryTypes, DataTypes, Model } from "sequelize";
import "dotenv/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import express, {
  Application,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { Op } from "sequelize";

require("dotenv").config();
const pool = new pg.Pool();

const sequelize = new Sequelize(
  process.env.DATABASE_URL!, // added ! to tell typescript that it's not undefined
  {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

const app: Application = express();
app.use(bodyParser.json() as RequestHandler);
app.use(bodyParser.urlencoded({ extended: true }) as RequestHandler);

app.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.send(`time is ${rows[0].now}`);
});

interface Note {
  id: number;
  content: string;
  important: boolean;
  date: string;
}

class Note extends Model {}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // main key of the table
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    important: {
      type: DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true, // model names that are derived will be converted to underscored names
    timestamps: false, // table doesn't have to use created_at & updated_at
    modelName: "note",
  }
);

class User extends Model {}

interface User {
  id: number;
  username: string;
  name: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "user",
  }
);

User.hasMany(Note);
Note.belongsTo(User); // sequelize automatically creates an attribute called userId on the Note model

// Note.sync(); // generates a schema automatically from the model definition
// User.sync();

// sequelize.sync();
// console.log("All models were synchronized successfully.");

// USERS ROUTE HANDLERS
app.get("/api/users", async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Note,
      attributes: { exclude: ["userId"] }, // we don't need userId in this case so we won't retrieve it
    },
  });
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

app.get("api/users/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

// NOTES ROUTE HANDLERS

export interface tokenRequest extends Request {
  decodedToken?: any;
}

type where = {
  important?: boolean;
  content?: any;
};

app.get("/api/notes", async (req, res) => {
  const where: where = {};

  if (req.query.important) {
    where.important = req.query.important === "true";
  }

  if (req.query.search) {
    where.content = {
      [Op.substring]: req.query.search,
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
  res.json(notes); // get notes in json format as a response
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

app.post(
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

app.get("/api/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  // sequelize query that looks for primary key (id is the defined primary key in the note model)
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (note) {
    await note.destroy();
  }
  res.status(204).end();
});

app.put("api/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (note) {
    note.important = req.body.important;
    await note.save();
    res.json(note);
  } else {
    res.status(404).end();
  }
});

// LOGIN ROUTE HANDLERS

app.post("/api/login", async (request, response) => {
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

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
