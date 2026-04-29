// import passport from "passport";
// import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oidc";
// const Config = require("../Config/Config")

// interface GoogleProfile {
//     id: string;
//     displayName: string;
//     name: {
//         familyName: string;
//         givenName: string;
//     };
//     emails: Array<{ value: string; verified: boolean }>;
//     photos: Array<{ value: string }>;
//     provider: string;
// }

// interface GoogleUser {
//     googleId: string;
//     email: string;
//     name: string;
//     avatar?: string;
// }

// const  googleStrategyOptions = {
//     clientID:Config.GOOGLE_CLIENT_ID!,
//     clientSecret:Config.GOOGLE_CLIENT_SECRET!,
//     callbackURL: '/auth/google/callback',
//     scope: ['profile', 'email']
// }