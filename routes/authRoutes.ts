import express from "express";
const authRouter = express.Router();
const authController = require("../controllers/auth")

authRouter.get("/register", authController.register_get);
authRouter.post("/register", authController.register_post);
authRouter.get("/login", authController.login_get);
authRouter.post("/login", authController.login_post);

export { authRouter };