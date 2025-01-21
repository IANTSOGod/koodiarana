"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const dotenv_1 = require("dotenv");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, dotenv_1.configDotenv)({ path: ".env" });
const key = process.env.JWT_SECRET;
const generateToken = (email) => {
    return jsonwebtoken_1.default.sign({ email }, key, { expiresIn: "1h" });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, key);
};
exports.verifyToken = verifyToken;
