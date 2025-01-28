const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connecting to MongoDb: ", error.message);
        console.log("Cause:", error.cause);
        process.exit(1);
    }
};

module.exports = connectDb;
