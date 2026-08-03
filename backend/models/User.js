const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: 6
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    profilePhoto: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        default: ''
    },

    state: {
        type: String,
        default: ''
    },

    location: {
        type:String,
        default: ''
    },

    lga: {
        type: String,
        default: ''
    },

    language: {
        type: String,
        enum: ['English', 'Hausa'],
        default: 'English'
    },

    role: {
        type: String,
        enum: ['farmer', 'buyer', 'extension_officer', 'admin'],
        default: 'farmer'
    },

    isVerified: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

// Hash password
UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();

});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);