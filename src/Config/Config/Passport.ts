const Config = require("../Config/Config")

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../../Modules/Modal/UserSchema/User';
import { boolean } from 'zod';

export interface GUser {
    googleId: string,
    name: string,
    email: string,
    password: string,
    otpAdded: boolean
}

const configureGooglePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: Config.GOOGLE_CLIENT_ID!,
        clientSecret: Config.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/api/Ts/v1/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            // Logic here

            let isExistingUser = await UserModel.findOne({ email: profile.emails?.[0]?.value });

            if (isExistingUser) {
                // update google id if email is found
                if (!isExistingUser.googleId) {
                    isExistingUser.googleId = profile.id;
                    await isExistingUser.save();
                }
                return done(null, isExistingUser);
            }

            const randomPassword = Math.random().toString(36).slice(-16) + 
                                  Math.random().toString(36).slice(-16);

            const user: GUser = {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                password: randomPassword,
                otpAdded: true
            };

            await UserModel.create(user)



            return done(null, user);
        } catch (error) {
            return done(error as Error);
        }
    }));

    return passport;
};

export { configureGooglePassport };
export default passport;