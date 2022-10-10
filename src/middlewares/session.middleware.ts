import { NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import connectMongo from "connect-mongo";

const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const storeOptions = {
    mongoUrl: process.env.DB_URI,
  };
  const sessionOptions: SessionOptions = {
    secret: "1213123123", // TODO: secure this
    resave: false, // if set to true -> it will create a new session for every request, even if the request is coming from the same client, it will create more load in the server
    saveUninitialized: false, //  if set to true -> it will add cookie to the response even if the user is not authenticated , we will tell express-session to create the cookie using passport, make this false and go to postman and make a request to the server and see the cookie in the response as we are not authenticated
    store: connectMongo.create(storeOptions),
  };

  return session(sessionOptions)(req, res, next);
};

export default sessionMiddleware;
