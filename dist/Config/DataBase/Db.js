"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Config = require('../config/config');
class DataBase {
    constructor() {
        this.isConnected = false;
        this.retryCount = 0;
        this.MAX_RETRIES = 5;
        this._connect();
        this._setupEventListeners();
    }
    _connect() {
        if (this.retryCount >= this.MAX_RETRIES) {
            console.error(`❌ Failed to connect after ${this.MAX_RETRIES} attempts. Exiting...`);
            process.exit(1);
        }
        mongoose_1.default.connect(Config.DB_URL)
            .then(() => {
            this.isConnected = true;
            this.retryCount = 0;
            console.log(' Connected to MongoDB');
        })
            .catch((err) => {
            this.isConnected = false;
            this.retryCount++;
            console.error(` Connection failed (attempt ${this.retryCount}/${this.MAX_RETRIES}):`, err.message);
            // Retry with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
            console.log(` Retrying in ${delay / 1000} seconds...`);
            setTimeout(() => this._connect(), delay);
        });
    }
    _setupEventListeners() {
        mongoose_1.default.connection.on('disconnected', () => {
            console.log(' MongoDB disconnected');
            if (this.isConnected) {
                this.isConnected = false;
                console.log(' Attempting to reconnect...');
                this._connect();
            }
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error(' MongoDB error:', err.message);
        });
        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log(' MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.default = new DataBase();
