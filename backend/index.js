require("dotenv").config(); // Load dotenv at the top
const express = require("express");
const connectDb = require('./db/connectDb');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path'); // Use path from CommonJS

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// This allows us to parse incoming request with JSON payload
app.use(express.json());

// This will allow us to parse incoming cookies
app.use(cookieParser());

app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
    connectDb();
    console.log("Server is running on port: ", PORT);
});
