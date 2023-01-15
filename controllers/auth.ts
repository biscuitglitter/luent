import { Request, Response } from "express";
import { User } from "../models";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");

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

module.exports.login_post = async (request: Request, response: Response) => {
  const { username, password } = request.body;
  await User.findOne({
    where: { username: username },
  }).then(async (user) => {
    if (!user) {
      response
        .status(401)
        .json({ success: false, msg: "could not find user" });
    }
    if (user) {
      await bcrypt.compare(password, user.password).then((result: any) => {
        if (result) {
          const token = jwt.sign(
            {
              username: user?.username,
              id: user?.id,
            },
            SECRET
          );
          response.status(200).json({
            success: true,
            token: token,
          });
        } else {
          console.log(password, user.password);
          response
            .status(401)
            .json({ success: false, msg: "you entered the wrong password" });
        }
      });
    }
  });
};
