import mongoose from 'mongoose';
const Config = require('../config/config');

class DataBase {
    private isConnected: boolean = false;
    private retryCount: number = 0;
    private readonly MAX_RETRIES: number = 5;

    constructor() {
        this._connect();
        this._setupEventListeners();
    }

    private _connect(): void {
        if (this.retryCount >= this.MAX_RETRIES) {
            console.error(`❌ Failed to connect after ${this.MAX_RETRIES} attempts. Exiting...`);
            process.exit(1);
        }

        mongoose.connect(Config.DB_URL)
            .then((): void => {
                this.isConnected = true;
                this.retryCount = 0;
                console.log(' Connected to MongoDB');
            })
            .catch((err: Error): void => {
                this.isConnected = false;
                this.retryCount++;
                console.error(` Connection failed (attempt ${this.retryCount}/${this.MAX_RETRIES}):`, err.message);

                // Retry with exponential backoff
                const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
                console.log(` Retrying in ${delay / 1000} seconds...`);
                setTimeout(() => this._connect(), delay);
            });
    }

    private _setupEventListeners(): void {
        mongoose.connection.on('disconnected', () => {
            console.log(' MongoDB disconnected');
            if (this.isConnected) {
                this.isConnected = false;
                console.log(' Attempting to reconnect...');
                this._connect();
            }
        });

        mongoose.connection.on('error', (err: Error) => {
            console.error(' MongoDB error:', err.message);
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log(' MongoDB connection closed through app termination');
            process.exit(0);
        });
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default new DataBase();