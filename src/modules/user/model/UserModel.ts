import mongoose from "mongoose";
import {User} from "../types/UserType";

const userSchema = new mongoose.Schema<User>({
        _id: {type: String, required: true},
        login: {type: String, required: true, unique: true, min: 3, max: 10},
        passwordHash: {type: String, required: true},
        email: {type: String, required: true, unique: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/},
        createdAt: {type: String, default: new Date().toISOString()},
        isActive: {type: Boolean, required: true}
    }
)

export const UserModel = mongoose.model('users', userSchema)
