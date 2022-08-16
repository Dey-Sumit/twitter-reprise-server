/*
FROM DOCS :
 You as the developer are responsible for ensuring that your document interface lines up with your Mongoose schema. For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface.

*/

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
