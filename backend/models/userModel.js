const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: {
        type : String,
        unique : true,
        required : true
    },
    password: {
        type :  String,
        required: true
    },
    name: {
        type : String,
        required: true
    },
    lastLogin : {
        type : Date,
        default : Date.now
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt : Date
}, {timestamps: true})


const user = mongoose.model('User', userSchema)

module.exports = user