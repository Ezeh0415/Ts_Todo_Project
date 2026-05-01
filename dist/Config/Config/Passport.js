"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGooglePassport = void 0;
const Config = require("../Config/Config");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = require("../../Modules/Modal/UserSchema/User");
const configureGooglePassport = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: Config.GOOGLE_CLIENT_ID,
        clientSecret: Config.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/Ts/v1/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Logic here
            let isExistingUser = await User_1.UserModel.findOne({ email: profile.emails?.[0]?.value });
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
            const user = {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                password: randomPassword,
                otpAdded: true
            };
            await User_1.UserModel.create(user);
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    return passport_1.default;
};
exports.configureGooglePassport = configureGooglePassport;
exports.default = passport_1.default;
