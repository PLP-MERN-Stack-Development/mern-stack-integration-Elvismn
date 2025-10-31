// User.js - Mongoose model for application users

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
{
name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Hide password by default
    },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    },
},
{ timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();

const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function () {
return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
});
};

module.exports = mongoose.model('User', UserSchema);
