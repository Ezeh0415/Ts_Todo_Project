"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const router = require("./Modules/Router/UserRouter");
const passport_1 = __importDefault(require("passport"));
const session = require('express-session');
const Config = require("./Config/Config");
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function connectWithRetry(maxRetries = 5) {
    for (let i = 1; i <= maxRetries; i++) {
        const Db = require("./Config/DataBase");
        if (Db) {
            console.log("Database Connected");
            return true;
        }
        console.log(`Connection failed. Retrying (${i}/${maxRetries})...`);
        await delay(5000);
    }
    console.log("Database connection failed after", maxRetries, "attempts");
    return false;
}
connectWithRetry();
// Session middleware (REQUIRED for passport)
app.use(session({
    secret: Config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/api/Ts/v1", router.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
