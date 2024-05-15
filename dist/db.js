"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
mongoose_1.default.connect(process.env.MONGODB_URI).then((data) => {
    console.log('Connected to MongoDB Successfully.');
}).catch((error) => {
    console.log('Error connecting to MongoDB\n');
    console.log(error);
});
const UserSchema = new mongoose_1.default.Schema({
    'email': String,
    'password': String,
    'devices': Array
});
const DeviceSchema = new mongoose_1.default.Schema({
    'name': String,
    'datum': Array,
    'owner': Array
});
const User = mongoose_1.default.model('Users', UserSchema);
exports.User = User;
const Device = mongoose_1.default.model('Device', DeviceSchema);
exports.Device = Device;
