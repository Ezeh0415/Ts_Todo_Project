const mongoose = require('mongoose');
const Config = require('../config/config');

class DataBase {
    constructor() {
        this._connect();
    }

   private  _connect(): void {
        mongoose.connect(Config.DB_URL)
            .then((): void => console.log('Connected to MongoDB'))
            .catch((err: Error): void => console.log('Connection failed', err));
    }
}
module.exports = new DataBase();