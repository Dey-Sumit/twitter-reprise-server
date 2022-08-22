import { NextFunction, Request, Response } from "express";
import User from "models/User";
import passport from "passport";

export const me = (req: Request, res: Response) => {
  res.json({
    message: "Hello World",
    sessionId: req.session.id,
  });
};
export const signup = async (req: Request, res: Response) => {
  // TODO : Handle validation
  const { name, username, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(403).json({ message: "Email already exists" });
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return res.status(403).json({ message: "Username already exists" });
    }

    const user = await User.create({ name, username, email, password });

    req.login(user, (err) => {
      if (err) throw err;
      res.status(201).json(req.user);
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Something went wrong",
    });
  }
};
export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err, user) => {
    if (err) return res.status(401).json(err);

    req.login(user, (err) => {
      if (err) throw err; // if any issue while storing the user in the session
      res.status(201).json(req.user);
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
};
