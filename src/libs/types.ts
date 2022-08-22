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

  isValidPassword?: (password: string) => Promise<boolean>;

  // virtual fields
  noOfFollowers: number;
  noOfFollowing: number;
  noOPosts: number;
  noOfNotifications: number;
}
