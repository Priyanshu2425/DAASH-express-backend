import mongoose from 'mongoose'
import * as dotenv from 'dotenv';
dotenv.config();


mongoose.connect(process.env.MONGODB_URI as string).then((data)=>{
    console.log('Connected to MongoDB Successfully.');
}).catch((error)=>{
    console.log('Error connecting to MongoDB\n');
    console.log(error);
});


const UserSchema = new mongoose.Schema({
    'email': String,
    'password': String,
    'devices': Array
})

const DeviceSchema = new mongoose.Schema({
    'name': String,
    'datum': Array,
    'owner': Array
})

const User = mongoose.model('Users', UserSchema);
const Device = mongoose.model('Device', DeviceSchema);

export { User, Device };