import { User } from "../../models/User"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config";

const serviceCreateUser = async (name: string, email: string, password: string, phone: string) => {
    const hashedPass = await bcrypt.hash(password, 10);

    try {
        const user = new User({
            name,
            email,
            password: hashedPass,
            phone
        });

        const savedUser = await user.save();
        
        const token = jwt.sign({
            userId: savedUser._id.toString(),
            email: savedUser.email
        }, config.JWT_SECRET_KEY || "", {
            expiresIn: "7d"
        });
        
        return {
            success: true,
            data: {
                user: {
                    id: savedUser._id.toString(),
                    name: savedUser.name,
                    email: savedUser.email
                },
                token: token
            }
        }
    } catch(error: any) {
        if (error.code === 11000) {
            return {success: false, message: "Email already exists"}
        }
        return {success: false, message: error.message}
    }
}

const loginUser = async(email: string, password: string) => {
    const user = await User.findOne({ email });
    
    if(!user) {
        return { success: false, message: "Email or Password Did not match"}
    }

    const passMatched = await bcrypt.compare(password, user.password);

    if(!passMatched) {
        return { success: false, message: "Email or Password Did not match"}
    }
    
    const token = jwt.sign({
        userId: user._id.toString(),
        email: user.email
    }, config.JWT_SECRET_KEY || "", {
        expiresIn: "7d"
    });
    
    return {
        success: true,
        data: {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            },
            token: token
        }
    }
}

export const authServices = {
    serviceCreateUser, 
    loginUser
}
