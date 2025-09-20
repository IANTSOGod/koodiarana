"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.generateOtp = void 0;
const dotenv_1 = require("dotenv");
const otplib_1 = require("otplib");
(0, dotenv_1.configDotenv)({ path: ".env" });
otplib_1.totp.options = {
    digits: 6, // Nombre de chiffres pour l'OTP
    step: 300,
};
const secret = process.env.OTP_SECRET;
const generateOtp = () => {
    return otplib_1.totp.generate(secret);
};
exports.generateOtp = generateOtp;
const verifyOtp = (otp) => {
    return otplib_1.totp.check(otp, secret);
};
exports.verifyOtp = verifyOtp;
