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
            message: "oops! username or password is not correct",
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
