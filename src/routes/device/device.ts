import express, { Request, Response } from 'express'
import z from 'zod'
import { auth } from '../../middleware/auth'
import { User, Device } from '../../db';

const deviceRouter = express.Router();

deviceRouter.get('/', auth, async(req: Request, res: Response)=>{
    const userEmail = req.user_email;

    try{
        const user = await User.findOne({email: userEmail});
        if(user)
            return res.status(200).json({'devices': user.devices});
        else return res.status(200).json({'message': 'User not found'});
    }catch(error){
        return res.status(200).json({'message': 'Error getting devices'});
    }
    
})

deviceRouter.get('/:id', auth, async(req: Request, res: Response)=>{
    const userEmail = req.user_email;
    const deviceId = req.params.id;
    try{
        const user = await User.findOne({email: userEmail});
        const device = await Device.findOne({_id: deviceId});

        if(device){
            if(user && device.owner.indexOf(user._id) >= 0) 
                return res.status(200).json({'device': device});
        }
        return res.status(404).json({'message': 'Device not found'});
    }catch(error){
        return res.status(404).json({'message': 'Error getting device'});
    }
})

deviceRouter.post('/addDevice', auth, async(req: Request, res: Response)=>{
    const userEmail = req.user_email;
    const user = await User.findOne({email: userEmail});
   
    if(user){
        let device = req.body;
        const deviceSchema = z.object({
            'name': z.string().min(1)
        })
    
        const deviceValidated = deviceSchema.safeParse(device); 
        if(deviceValidated.success){
            device.datum = [];
            device.owner = [user._id];
            
            const new_device = await Device.create({...device});

            user.devices.push({device_id: new_device._id, device_name: new_device.name});
            await user.save();

            return res.status(200).json({'message': 'Device added'});
        }
        console.log(device);
        return res.status(200).json({'message': 'Invalid device details'});
    }
    res.status(200).json({'message': 'Invalid User'});
})

deviceRouter.delete('/deleteDevice/:id', auth, async(req: Request, res: Response)=>{
    const userEmail = req.user_email;
    const user = await User.findOne({email: userEmail});

    const deviceId = req.params.id;
    if(user){
        const device = await Device.findOne({_id: deviceId});
        if(device && device.owner.indexOf(user._id) >= 0){
            user.devices.splice(user.devices.indexOf(device._id), 1);
            await user.save();

            await Device.findOneAndDelete({_id: deviceId});
            return res.status(200).json({'message': 'Device deleted'});
        }

        return res.status(401).json({'message': 'Error deleting device'});
    }

    res.status(404).json({'message': 'Invalid user'});
})


deviceRouter.get('/addData/:id/:data', async(req: Request, res: Response)=>{
    const deviceId: string = req.params.id;
    const sensorVal: number = parseInt(req.params.data);    

    const SensorValSchema = z.object({
        'sensorVal': z.number()
    })

    const validated = SensorValSchema.safeParse({"sensorVal": sensorVal});

    if(validated.success){
        try{
            const device = await Device.findOne({_id: deviceId});
            if(device){
                device.datum.push(sensorVal);
                await device.save();
                return res.status(200).json({'message': 'Device data added'});
            }else{
                return res.status(404).json({'message': 'Error adding data'});
            }
        }catch(error){
            return res.status(200).json({'message': 'Error adding data'});
        }
    }
    
    res.status(200).json({'message': 'Invalid device details'});
})

deviceRouter.get('/data/:id', async(req: Request, res: Response)=>{
    const deviceId = req.params.id;

    try{
        const device = await Device.findOne({_id: deviceId});
        if(device){
            const data = device.datum;
            return res.status(200).json({'data': data});
        }else{
            return res.status(200).json({'message': 'Error getting data'});
        }
    }catch(error){
        console.log(error);
        return res.status(200).json({'message': 'Error retrieving data'});
    }

})

export { deviceRouter };