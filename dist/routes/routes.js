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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zod_1 = __importDefault(require("zod"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const device_1 = require("../routes/device/device");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const UserSchema = zod_1.default.object({
    'email': zod_1.default.string().email(),
    'password': zod_1.default.string().min(7),
});
router.use('/devices', device_1.deviceRouter);
router.post('/login', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user_email)
        return res.status(200).json({ 'message': 'User logged in' });
    const user = req.body;
    const validated = UserSchema.safeParse(user);
    if (validated.success) {
        try {
            const foundUser = yield db_1.User.findOne({ email: user.email });
            if (!foundUser) {
                return res.status(404).json({ 'message': 'User not found' });
            }
            if (foundUser.password === user.password) {
                const token = jsonwebtoken_1.default.sign({ 'email': foundUser.email }, process.env.JWT_SECRET);
                return res.status(200).json({ 'message': 'User Logged In', token });
            }
            return res.status(200).json({ 'message': 'Invalid credentials' });
        }
        catch (error) {
            return res.status(401).json({ 'message': 'Error logging in' });
        }
    }
    res.status(401).json({ 'message': 'Invalid details' });
}));
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const validated = UserSchema.safeParse(user);
    if (validated.success) {
        try {
            user.device = [];
            const new_user = new db_1.User(user);
            yield new_user.save();
            const token = jsonwebtoken_1.default.sign({ 'email': new_user.email }, process.env.JWT_SECRET);
            return res.status(200).json({ 'message': 'Registration successful', token });
        }
        catch (error) {
            return res.status(200).json({ 'message': 'Error signing up' });
        }
    }
    return res.status(401).json({ 'message': 'Invalid details' });
}));
exports.default = router;
