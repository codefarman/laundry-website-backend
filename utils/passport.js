import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import User from '../models/User.js';
import { generateToken } from './jwt.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        await user.save();
      } else {
        user.googleId = profile.id;
        await user.save();
      }
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Facebook Strategy (uncommented)
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = new User({
          facebookId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        await user.save();
      } else {
        user.facebookId = profile.id;
        await user.save();
      }
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Apple Strategy (commented out to remove)
// passport.use(new AppleStrategy({
//   clientID: process.env.APPLE_CLIENT_ID,
//   teamID: process.env.APPLE_TEAM_ID,
//   keyID: process.env.APPLE_KEY_ID,
//   privateKey: process.env.APPLE_PRIVATE_KEY,
//   callbackURL: '/api/auth/apple/callback',
// }, async (accessToken, refreshToken, idToken, profile, done) => {
//   try {
//     let user = await User.findOne({ appleId: idToken.sub });
//     if (!user) {
//       user = await User.findOne({ email: idToken.email });
//       if (!user) {
//         user = new User({
//           appleId: idToken.sub,
//           name: idToken.name || 'Apple User',
//           email: idToken.email,
//         });
//         await user.save();
//       } else {
//         user.appleId = idToken.sub;
//         await user.save();
//       }
//     }
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// }));