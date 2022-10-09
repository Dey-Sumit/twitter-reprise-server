import express from "express";
import dotenv from "dotenv";

import morgan from "morgan";
import cors from "cors";

import { createServer } from "http";

import log from "@libs/logger";
import connectToDataBase from "utils/connect-db";
import authRouter from "@routes/auth.routes";
import sessionMiddleware from "middlewares/session.middleware";
import passport from "config/passport.config";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = createServer(app);

app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport works on top of the express session. So you have to use the express session middleware before using Passport middleware.
// Session middleware is used to store the user's session in the server's memory.
app.use(sessionMiddleware);

// Passport middleware is used to authenticate the user.
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);

httpServer.listen(PORT, () => {
  connectToDataBase();
  log.info(`Server is Running on ${PORT}`);
});
