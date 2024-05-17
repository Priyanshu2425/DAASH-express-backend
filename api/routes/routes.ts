import express, {Request, Response, Router} from 'express'
import dotenv from 'dotenv'
dotenv.config();

import z from 'zod'
import jwt from 'jsonwebtoken'

import { deviceRouter } from './device/device'

import { User, Device} from '../db'
import { auth } from '../middleware/auth'

const router: Router = express.Router();


const UserSchema = z.object({
    'email': z.string().email(),
    'password': z.string().min(7),
})

router.use('/devices', deviceRouter);

router.post('/login', auth, async(req: Request, res: Response)=>{
    if(req.user_email) return res.status(200).json({'message': 'User logged in'});
    
    const user = req.body;

    const validated = UserSchema.safeParse(user);
    if(validated.success){
        try{
            const foundUser = await User.findOne({email: user.email});
            if(!foundUser){
                return res.status(404).json({'message': 'User not found'});
            }

            if(foundUser.password === user.password){
                const token = jwt.sign({'email': foundUser.email}, process.env.JWT_SECRET as string);
                return res.status(200).json({'message': 'User Logged In', token});
            }

            return res.status(200).json({'message': 'Invalid credentials'});

        }catch(error){
            return res.status(401).json({'message': 'Error logging in'});
        }
    }

    res.status(401).json({'message': 'Invalid details'});
})

router.post('/signup', async(req: Request, res: Response)=>{
    const user = req.body;

    const validated = UserSchema.safeParse(user);
    if(validated.success){
        try{
            user.device = [];
            const new_user = new User(user);
            await new_user.save();

            const token = jwt.sign({'email': new_user.email}, process.env.JWT_SECRET as string);
            return res.status(200).json({'message': 'Registration successful', token});
        }catch(error){
            return res.status(200).json({'message': 'Error signing up'});
        }
    }

    return res.status(401).json({'message': 'Invalid details'});
})



export default router;