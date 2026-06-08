import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path:  path.join(process.cwd(), ".env")});

export const config = {
    PORT: process.env.PORT || 3000, 
    MONGODB_URI: process.env.MONGODB_URI || "",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || ""
}
