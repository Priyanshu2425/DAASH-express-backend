import { Request, Response, NextFunction } from "express";
import z from 'zod';
import jwt from 'jsonwebtoken';

import * as dotenv from 'dotenv';
dotenv.config();

const UserSchema = z.object({
    'email': z.string().email(),
    'password': z.string().min(7)
})

declare global {
    namespace Express {
        interface Request {
            user_email?: string;
        }
    }
}

function auth(req: Request, res: Response, next: NextFunction){
    const token = req.headers.authorization;

    if(token){
        let decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if(typeof decoded === 'object' && 'email' in decoded)
            req.user_email = decoded.email;

        if(decoded){
            next();
            return
        }
    }

    const user = req.body;
    const validated = UserSchema.safeParse(user);

    if(validated.success){
        next();
        return;
    }

    return res.status(401).json({'message': 'Invalid user details.'});

}

export { auth };