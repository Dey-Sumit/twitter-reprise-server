
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

---
---