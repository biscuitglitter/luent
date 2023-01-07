import express from "express";
import pg from "pg";
import { Sequelize, QueryTypes, DataTypes, Model } from "sequelize";
import "dotenv/config";

require("dotenv").config();

const pool = new pg.Pool();

const app = express();

app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.send(`time is ${rows[0].now}`);
});

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
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

Note.sync() // generates a schema automatically from the model definition

app.get("/api/notes", async (req, res) => {
const notes = await Note.findAll(); // sequelize query findAll()
  res.json(notes); // get notes in json format as a response
});

app.post("/api/notes", async (req, res) => {
  try {
    const note = await Note.create(req.body); // create sequelize query
    return res.json(note);
  } catch (error) {
    return res.status(400).json({ error }); // error handling
  }
});

app.get("/api/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id); // sequelize query that looks for primary key (id is the defined primary key in the note model)
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

app.delete("/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (note) {
    await note.destroy();
  }
  res.status(204).end();
});

app.put("/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (note) {
    note.important = req.body.important;
    await note.save();
    res.json(note);
  } else {
    res.status(404).end();
  }
});

const port = process.env.PORT || 4242;

app.listen(port);
