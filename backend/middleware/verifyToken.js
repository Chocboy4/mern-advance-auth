const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) =>  {
    const token = req.cookies.token
    if(!token) return res.status(401).json({success: false, message: "unauthorized - no token provided"})
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded) return res.status(401).json({success:false, message: 'unauthorized - invalide Token'})
        req.userId = decoded.userId
        next()
    } catch (error) {
        console.log("Error in verifyToken", error);
        return res.status(500).json({success: false, message: "Server Error"})
        
    }
}



module.exports = verifyToken