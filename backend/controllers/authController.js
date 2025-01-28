const User = require('../models/userModel')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const generateTokenAndSetCookies = require('../utils/generateTokenAndSetCookies');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../mailtrap/emails');
const user = require('../models/userModel');


const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            throw new Error("ALL FIELDS ARE REQUIRED");
        }

        const userAlreadyExists = await User.findOne({ email });
        console.log("Checking if user exists:", userAlreadyExists);  // Log the user object found

        if (userAlreadyExists) {
            console.log("User already exists, returning early."); // Log for debugging
            return res.status(400).json({ success: false, message: "User already exist" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        // Save user
        await user.save();
        console.log("User created successfully:", user); // Log for debugging

        // JWT
        generateTokenAndSetCookies(res, user._id);
        
        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        // Send success response
        return res.status(201).json({
            success: true,
            message: "User has been created",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.error("Error during signup:", error); // Log the error for debugging
        return res.status(400).json({ success: false, message: error.message });
    }
}

const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.error("Error during email verification:", error); 
        return res.status(500).json({
            success: false,
            message: "An error occurred during email verification"
        });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found"); // Log when user is not found
            return res.status(400).json({ success: false, message: "Email or password is incorrect" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Password is invalid"); // Log when password is incorrect
            return res.status(400).json({ success: false, message: "Email or password is incorrect" });
        }

        // Only reach here if email and password are correct
        console.log("Credentials are valid. Generating token...");

        generateTokenAndSetCookies(res, user._id);

        // Update last login and save user
        user.lastLogin = new Date();
        await user.save();

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        console.error("Error", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};




const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json( {succes: true, message: "Logged out successfully"})
}

const forgotPassword = async (req, res) => {
    const { email} = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({status: false, message: "User does not exist"} )
        }
        // generate the reset token
        const resetToken = crypto.randomBytes(20).toString('hex')
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;   // token expires after 1 hour
        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        // send email
        await sendPasswordResetEmail(user.email, `http://localhost:5173/reset-password/${resetToken}`)

        res.status(200).json({ success: true, message: "Password reset link sent to your email"})

    } catch (error) {
        console.log("Error in forgetPassword", error)
        res.status(400).json({ success : false, message: error.message})
    }
}

const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcrypt.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if(!user){
            return res.status(400).json({ success: false, message: "User not found" })
        }
        res.status(200).json({ success: true, user })
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(500).json({ success: false, message: error.message })
        
    }
}

module.exports = { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth}