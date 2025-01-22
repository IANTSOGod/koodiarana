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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailer_1 = require("../config/mailer");
const jwt_1 = require("../config/jwt");
const dotenv_1 = require("dotenv");
const Otp_1 = require("../config/Otp");
(0, dotenv_1.configDotenv)({ path: ".env" });
const router = (0, express_1.Router)();
const domain = process.env.DOMAIN_NAME;
router.post("/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, text } = req.body;
    const societyEmail = process.env.SOCIETY_EMAIL;
    const mailOptions = {
        from: societyEmail, // Adresse email de l'expéditeur
        to: to, // Adresse email du destinataire
        subject: subject, // Sujet de l'email
        text: text, // Texte brut
    };
    try {
        const info = yield mailer_1.transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email envoyé" });
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
router.post("/sendVerificationLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    const payload = (0, jwt_1.verifyToken)(token);
    const societyEmail = process.env.SOCIETY_EMAIL;
    try {
        const mailOptions = {
            from: societyEmail, // Adresse email de l'expéditeur
            to: payload.email, // Adresse email du destinataire
            subject: "Email verification", // Sujet de l'email
            text: `Voici le lien de vérification de compte ${domain}/users/verifyEmail/${token}`, // Texte brut
        };
        const info = yield mailer_1.transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email envoyé" });
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
router.post("/sendOTP", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const societyEmail = process.env.SOCIETY_EMAIL;
    try {
        const otp = (0, Otp_1.generateOtp)();
        const mailOptions = {
            from: societyEmail, // Adresse email de l'expéditeur
            to: email,
            subject: "OTP by koodiarana",
            text: "Votre code OTP est " + otp,
        };
        const info = yield mailer_1.transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email envoyé" });
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
exports.default = router;
