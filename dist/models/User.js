"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose"); // Here I imported the Schema and the model / Schema is how the user should be / model is the operator, to create, read and delete users in the database;
// 2. Schema that defines the structure and rules of the database;
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Default value
    },
});
// 3. Model that gives us the interface to interact with the 'users' collection;
const UserModel = (0, mongoose_1.model)('User', UserSchema);
exports.default = UserModel;
