const GoogleStrategy = require("passport-google-oauth20");
import prisma from "#/prisma/prisma";
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "#/utils/variables";
import { hash } from "bcrypt";

module.exports = function (passport) {
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: parseInt(id) },
      });
      if (user) {
        done(null, user);
      } else {
        done(new Error("User not found"), null);
      }
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async function (_accessToken, _refreshToken, profile, cb) {
        const user = await prisma.user.findFirst({
          where: { googleId: String(profile.id), provider: profile.provider },
        });

        if (!user) {
          const name = profile.displayName;
          const newUser = await prisma.user.create({
            data: {
              name,
              email: profile._json.email,
              password: await hash(`${profile.provider}/12345`, 10),
              googleId: String(profile.id),
              provider: profile.provider,
              avatar: profile?.photos[0]?.value,
            },
          });
          return cb(null, newUser);
        }

        return cb(null, user);
      }
    )
  );
};
