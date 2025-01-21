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
const express_1 = require("express");
const user_1 = __importDefault(require("../schema/user"));
const bcrypt_1 = require("bcrypt");
const jwt_1 = require("../config/jwt");
const Otp_1 = require("../config/Otp");
const router = (0, express_1.Router)();
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nom, prenom, dateNaissance, email, num, password, status } = req.body;
    const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
    try {
        const newUser = new user_1.default({
            nom: nom,
            prenom: prenom,
            dateNaissance: dateNaissance,
            email: email,
            num: num,
            password: hashedPassword,
            status: status,
        });
        const newUserDoc = yield newUser.save();
        const token = (0, jwt_1.generateToken)(newUserDoc.email);
        res.status(201).json({ token: token });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
router.get("/verifyEmail/:token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        if (payload) {
            const user = yield user_1.default.findOne({
                email: payload.email,
            });
            if (user) {
                user.emailVerified = true;
                yield user.save();
                res.status(200).json({ message: "Email vérifié" });
            }
            else {
                res.status(404).json({ message: "Utilisateur non trouvé" });
            }
        }
        else {
            res.status(401).json({ message: "Token invalide" });
        } // Mettre à jour le statut de vérification
    }
    catch (error) {
        res.status(400).json({ message: "Token invalide ou expiré" });
    }
}));
router.post("/verifyOTP", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    try {
        const isVerified = (0, Otp_1.verifyOtp)(otp);
        if (isVerified) {
            res.status(200).json({ message: "OTP vérifié" });
        }
        else {
            res.status(401).json({ message: "OTP invalide" });
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
router.post("/sendResetPasswordLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    try {
        const user = yield user_1.default.findOne({ email: email });
        const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, 10);
        if (user) {
            user.password = hashedPassword;
            yield (user === null || user === void 0 ? void 0 : user.save());
            res.status(200).json({ message: "Mot de passe réinitialisé" });
        }
        else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
exports.default = router;
