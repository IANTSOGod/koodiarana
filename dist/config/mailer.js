"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const dotenv_1 = require("dotenv");
const nodemailer_1 = __importDefault(require("nodemailer"));
(0, dotenv_1.configDotenv)({ path: ".env" });
const societyEmail = process.env.SOCIETY_EMAIL;
const societyPassword = process.env.SOCIETY_PASSWORD;
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Ou un autre service : 'hotmail', 'yahoo', etc.
    auth: {
        user: societyEmail, // Remplacez par votre email
        pass: societyPassword, // Mot de passe ou App Password
    },
});
// Vérifier la connexion au service de messagerie
exports.transporter.verify((error, success) => {
    if (error) {
        console.error("Erreur Nodemailer :", error);
    }
    else {
        console.log("Nodemailer prêt !");
    }
});
