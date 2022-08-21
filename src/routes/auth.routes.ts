import express from "express";
import { login, logout, me, signup } from "@controllers/auth.controller";

const authRouter = express.Router();

// router works on top-to-bottom, so the first route that matches will be invoked
authRouter.get("/me", me);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.delete("/logout", logout);

export default authRouter;
