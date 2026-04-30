const Config = require("../Config/Config")

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../../Modules/Modal/UserSchema/User';

const configureGooglePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: Config.GOOGLE_CLIENT_ID!,
        clientSecret: Config.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            // Logic here

            let user = await UserModel.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
                // update google id if email is found
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            const newUser = await UserModel.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                password: profile.id,
                otpAdded: true
            });



            return done(null, newUser);
        } catch (error) {
            return done(error as Error);
        }
    }));

    return passport;
};

export { configureGooglePassport };
export default passport;