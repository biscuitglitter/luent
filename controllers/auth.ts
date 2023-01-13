import { Request, Response } from "express";
import { User } from "../models";
const bcrypt = require("bcrypt");

module.exports.register_get = (request: Request, response: Response) => {
  response.render("register");
};

module.exports.register_post = async (request: Request, response: Response) => {
  const salt = await bcrypt.genSalt();
  request.body.password = await bcrypt.hash(request.body.password, salt);
  console.log("request.body", request.body);
  try {
    const user = await User.create(request.body);
    response.json(user);
  } catch (error) {
    return response.status(400).send("error, user not created");
  }
};

module.exports.login_get = (request: Request, response: Response) => {
  response.render("login");
};

module.exports.login_post = (request: Request, response: Response) => {
  response.send("user logged in");
};