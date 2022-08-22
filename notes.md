


```
User 1 : {
    "name":"Sumit Dey",
    "email":"abc@gmail.com",
    "password":"123456",
    "username":"sd123"
}
{
    "name":"Amit Dey",
    "email":"ad1234@gmail.com",
    "password":"123456",
    "username":"ad1234"
}

```



1. Set up Project with express-boilerplate
 (make sure to change the pino implementaion if you get any error)
https://github.com/Dey-Sumit/express-boilerplate 

- main -> without mongo but wrong pino
- feature/integrate-mongo-db : with mongo but correct pino

```
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: null,
});

export default logger;

```

---
---


2. Connect to MongoDB
Create local file .env with the following content:

```
CLUSTER_PASSWORD = 
CLUSER_USERNAME = sumit_twitter

DB_URI = mongodb+srv://sumit_twitter:<password>@cluster-twitter-reprise.psuyxp2.mongodb.net/?retryWrites=true&w=majority
```

```
import logger from "@libs/logger";
import mongoose from "mongoose";

const connectToDataBase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    logger.error(`DB Connection error : ${error.message} `);
  }

  const connection = mongoose.connection;

  if (connection.readyState >= 1) {
    logger.info("Connected to DataBase");
    return;
  }

  connection.on("connected", () => logger.info("Connected to DataBase"));

  connection.on("error", (error) => logger.error(`DB Connection error : ${error.message} `));
};
export default connectToDataBase;


```

----
----

3. Create User Model with mongoose and typeScript and work on the Authentication
- docs: https://mongoosejs.com/docs/typescript.html
- `3-feature/user-modal`

```
// Interface : 

import mongoose from "mongoose";
type mongoose_id = string | mongoose.Types.ObjectId;

export interface IUser {
  _id: mongoose_id;
  name: string;
  username: string;
  password: string;
  profilePicture: string;
  bio: string;
  email: string;

  following: mongoose_id[];
  followers: mongoose_id[];
  likes: mongoose_id[];
  notifications: mongoose_id[];
  posts: mongoose_id[];

  validatePassword?: (password: string) => Promise<boolean>;

  // virtual fields
  noOfFollowers: number;
  noOfFollowing: number;
  noOPosts: number;
  noOfNotifications: number;
}

``` 

```
install packages : 
yarn add bcryptjs 
yarn add -D @types/bcryptjs
```
```
/*
FROM DOCS :
 You as the developer are responsible for ensuring that your document interface lines up with your Mongoose schema. For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface.

*/

TODO : add modal validation in depth 
https://thinkster.io/tutorials/node-json-api/creating-the-user-model


models/User.ts
import bcrypt from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "@libs/types";
import { generateRandomString } from "utils/general";
import User from "./User";

type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: `https://avatars.dicebear.com/api/avataaars/${generateRandomString()}.svg`,
      // "https://images.vexels.com/media/users/3/145908/preview2/52eabf633ca6414e60a7677b0b917d92-male-avatar-maker.jpg",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // people follow this user
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  {
    id: false,
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

// Virtual fields
UserSchema.virtual("noOfFollowers").get(function (this: UserDocument) {
  return this.followers?.length;
});
UserSchema.virtual("noOfFollowing").get(function (this: UserDocument) {
  return this.following?.length;
});
UserSchema.virtual("noOPosts").get(function (this: UserDocument) {
  return this.posts?.length;
});
UserSchema.virtual("noOfNotifications").get(function (this: UserDocument) {
  return this.notifications?.length;
});

UserSchema.methods.validatePassword = async function (enteredPassword) {
  const user = await User.findOne({ username: this.username }).select("password");

  return await bcrypt.compare(enteredPassword, user.password);
};

// middleware before saving the data
// hash the password during registration
UserSchema.pre("save", async function (this, next) {
  // run oly if the password field is modified (ex: during update profile)
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model<UserDocument>("User", UserSchema);

```
```
libs/general.ts
export const generateRandomString = () => (Math.random() + 1).toString(36).substring(4);
```

--------
--------
<br/>

**4. Auth -> create express routes, add controllers, and call in the index.ts**

```
=> routes/auth.routes.ts

import express from "express";
import { login, logout, me, signup } from "../controllers/auth.controller";

const authRouter = express.Router();

// router works on top-to-bottom, so the first route that matches will be invoked
authRouter.get("/me", me);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.delete("/logout", logout);

export default authRouter;
```
```
=> controllers/auth.controller.ts

export const me = (req, res) => {
  res.json({
    message: "Hello World",
  });
};
export const signup = () => {};
export const login = () => {};
export const logout = () => {};
```

```
=> index.ts 

import authRouter from "@routes/auth.routes";
app.use("/api/auth", authRouter);

--------------------------------------------------------------------------------
TEST : curl http://localhost:4000/api/auth/me  
--------------------------------------------------------------------------------
```

```
path-alias : tsconfig.json

    "baseUrl": "src",
    "paths": {
      "@libs/*": ["libs/*"],
      "@utils/*": ["utils/*"],
      "@routes/*": ["routes/*"],
      "@controllers/*": ["controllers/*"]
    },

```
---
---
<br/>

5. Bring in Passport,express-session, and configure it :

- express-session middleware, what it did is it basically create a session in the browser with a cookie.

Docs : https://www.passportjs.org/concepts/authentication/password/

Helpful docs:
-  https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
- https://blog.bitsrc.io/authentication-work-flow-using-express-session-and-passportjs-4291231285a5
- reason to use passport : 
   - It's easy to set up and use.
   - It's scalable , you can later use it with other authentication methods like Google, Facebook, Twitter etc.

```
yarn add passport passport-local express-session && yarn add -D @types/passport @types/passport-local @types/express-session
```

Instructions : 
- talk about the flow (from my YT video)
- create session middleware first 
```

Part 1 : 

import { NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";

const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sessionOptions: SessionOptions = {
    secret: "1213123123", // TODO: secure this
  };

  return session(sessionOptions)(req, res, next);
};

export default sessionMiddleware;

-------------

export const me = (req: Request, res: Response) => {
  res.json({
    message: "Hello World",
    sessionId: req.session.id,
  });
};

------------

app.use(express.urlencoded({ extended: true }));

// Passport works on top of the express session. So you have to use the express session middleware before using Passport middleware.

// Session middleware is used to store the user's session in the server's memory.
app.use(sessionMiddleware); <-- add the middleware

// Passport middleware is used to authenticate the user.

app.use("/api/auth", authRouter);

----
Hit on postman and check the cookies
```
```
Part 2 : 

  const sessionOptions: SessionOptions = {
    secret: "1213123123", // TODO: secure this

    resave: false, // if set to true -> it will create a new session for every request, even if the request is coming from the same client, it will create more load in the server

    saveUninitialized: false, // if set to true -> it will add cookie to the response even if the user is not authenticated , we will tell express-session to create the cookie using passport, make this false and go to postman and make a request to the server and see the cookie in the response as we are not authenticated
  };

```
Part 3 : Introducing Passport =>

=> attach local stratagy to passport middleware

```
passport.middleware.ts => 

import { IUser } from "@libs/types";
import User from "models/User";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      const user = await User.findOne({ username });

      if (user && (await user.isValidPassword(password))) {
        return done(null, user);
      } else
        done(
          {
            message: "username or password is not correct",
          },
          false
        ); // done will forward the call to the next middleware in the chain
    }
  )
);

/* Passport uses serializeUser function to persist user data (after successful authentication) into session.
 Function deserializeUser is used to retrieve user data from session.
*/

/* The user id (you provide as the second argument of the done function) is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

serializeUser determines which data of the user object should be stored in the session. 
req.session.passport.user = {id: 'xyz'} // the id of the user is stored in the session
*/
passport.serializeUser((user: IUser, done) => {
  console.log("inside serializeUser", user);

  done(null, user._id);
});

/*
The first argument of deserializeUser corresponds to the key of the user object that was given to the done function (serialized user) .
So your whole object is retrieved with help of that key.
*/
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log("inside deserializeUser", user);

    done(null, user); // The fetched object is attached to the request object as req.user
  } catch (error) {
    done(error); // something went wrong :(
  }
});

export default passport;

------------
=> index.ts

// Passport works on top of the express session. So you have to use the express session middleware before using Passport middleware.

// Session middleware is used to store the user's session in the server's memory.
app.use(sessionMiddleware);

// Passport middleware is used to authenticate the user.

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
```

```
=> Create one user and try to login with the credentials

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
    // TODO : remove password field from response
    res.json(user); // TODO : login the user and send the user object
  } catch (error) {
    console.log(error);
    res.json({
      message: "Something went wrong",
    });
  }
};

------------

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err, user) => {
    if (err) return res.status(401).json(err);

    req.login(user, (err) => {
      if (err) throw err; // if any issue while storing the user in the session
      res.status(201).json(req.user);
    });
  })(req, res, next);
};

------
=> go back to the user modal and add toJson method (filter out the password and some more stuff)

/* doc is the document(returned from database) to be serialized, ret(will contain all the virtual fields too) is the plain JS object that will be transformed into JSON. 
 You may then manipulate ret however you want.
 */

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    console.log("transform called", doc, ret);

    delete ret.password;

    ret.id = ret._id; // id is the same as _id
    delete ret._id; // delete the _id field from the returned object
    delete ret.__v; // filter out the __v field

    return ret;
  },
});

-------
=> go back to the signup controller (login after signup) and add the following code (exact same as login)

  const user = await User.create({ name, username, email, password });

  req.login(user, (err) => {
      if (err) throw err;
      res.status(201).json(req.user);
   });

CHECK IF THE COOKIE IS ADDED OR NOT 🔥
```

```
=> logout:

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
};


```
