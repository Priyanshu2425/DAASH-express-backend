"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
const auth_1 = require("../../middleware/auth");
const db_1 = require("../../db");
const deviceRouter = express_1.default.Router();
exports.deviceRouter = deviceRouter;
deviceRouter.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.user_email;
    try {
        const user = yield db_1.User.findOne({ email: userEmail });
        if (user)
            return res.status(200).json({ 'devices': user.devices });
        else
            return res.status(200).json({ 'message': 'User not found' });
    }
    catch (error) {
        return res.status(200).json({ 'message': 'Error getting devices' });
    }
}));
deviceRouter.get('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.user_email;
    const deviceId = req.params.id;
    try {
        const user = yield db_1.User.findOne({ email: userEmail });
        const device = yield db_1.Device.findOne({ _id: deviceId });
        if (device) {
            if (user && device.owner.indexOf(user._id) >= 0)
                return res.status(200).json({ 'device': device });
        }
        return res.status(404).json({ 'message': 'Device not found' });
    }
    catch (error) {
        return res.status(404).json({ 'message': 'Error getting device' });
    }
}));
deviceRouter.post('/addDevice', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.user_email;
    const user = yield db_1.User.findOne({ email: userEmail });
    if (user) {
        let device = req.body;
        const deviceSchema = zod_1.default.object({
            'name': zod_1.default.string().min(1)
        });
        const deviceValidated = deviceSchema.safeParse(device);
        if (deviceValidated.success) {
            device.datum = [];
            device.owner = [user._id];
            const new_device = yield db_1.Device.create(Object.assign({}, device));
            user.devices.push({ device_id: new_device._id, device_name: new_device.name });
            yield user.save();
            return res.status(200).json({ 'message': 'Device added' });
        }
        console.log(device);
        return res.status(200).json({ 'message': 'Invalid device details' });
    }
    res.status(200).json({ 'message': 'Invalid User' });
}));
deviceRouter.delete('/deleteDevice/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.user_email;
    const user = yield db_1.User.findOne({ email: userEmail });
    const deviceId = req.params.id;
    if (user) {
        const device = yield db_1.Device.findOne({ _id: deviceId });
        if (device && device.owner.indexOf(user._id) >= 0) {
            user.devices.splice(user.devices.indexOf(device._id), 1);
            yield user.save();
            yield db_1.Device.findOneAndDelete({ _id: deviceId });
            return res.status(200).json({ 'message': 'Device deleted' });
        }
        return res.status(401).json({ 'message': 'Error deleting device' });
    }
    res.status(404).json({ 'message': 'Invalid user' });
}));
deviceRouter.get('/addData/:id/:data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deviceId = req.params.id;
    const sensorVal = parseInt(req.params.data);
    const SensorValSchema = zod_1.default.object({
        'sensorVal': zod_1.default.number()
    });
    const validated = SensorValSchema.safeParse({ "sensorVal": sensorVal });
    if (validated.success) {
        try {
            const device = yield db_1.Device.findOne({ _id: deviceId });
            if (device) {
                device.datum.push(sensorVal);
                yield device.save();
                return res.status(200).json({ 'message': 'Device data added' });
            }
            else {
                return res.status(404).json({ 'message': 'Error adding data' });
            }
        }
        catch (error) {
            return res.status(200).json({ 'message': 'Error adding data' });
        }
    }
    res.status(200).json({ 'message': 'Invalid device details' });
}));
deviceRouter.get('/data/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deviceId = req.params.id;
    try {
        const device = yield db_1.Device.findOne({ _id: deviceId });
        if (device) {
            const data = device.datum;
            return res.status(200).json({ 'data': data });
        }
        else {
            return res.status(200).json({ 'message': 'Error getting data' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ 'message': 'Error retrieving data' });
    }
}));
