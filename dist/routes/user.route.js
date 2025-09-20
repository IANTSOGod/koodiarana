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
const bcryptjs_1 = require("bcryptjs");
const jwt_1 = require("../config/jwt");
const Otp_1 = require("../config/Otp");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
const router = (0, express_1.Router)();
(0, dotenv_1.configDotenv)({ path: ".env" });
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folderPath = "";
        switch (file.fieldname) {
            case "CIN1":
                folderPath = path_1.default.join(__dirname, "../assets/cinFront");
                break;
            case "CIN2":
                folderPath = path_1.default.join(__dirname, "../assets/cinBack");
                break;
            case "Profile":
                folderPath = path_1.default.join(__dirname, "../assets/profile");
                break;
            case "Moto":
                folderPath = path_1.default.join(__dirname, "../assets/moto");
                break;
            default:
                return cb(new Error("Champ de fichier invalide"), "");
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
const domain = process.env.DOMAIN_NAME;
router.post("/uploadCIN", upload.fields([
    { name: "CIN1", maxCount: 1 },
    { name: "CIN2", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield user_1.default.findOne({ email: email });
        const files = req.files;
        if (user) {
            user.photoCIN1 = `${domain}/assets/cinFront/${files.CIN1[0].filename}`;
            user.photoCIN2 = `${domain}/assets/cinFront/${files.CIN2[0].filename}`;
            yield user.save();
            res.status(201).json({ message: "Images CIN téléchargées" });
        }
        else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
router.post("/uploadOthers", upload.fields([
    { name: "Profile", maxCount: 1 },
    { name: "Moto", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield user_1.default.findOne({ email: email });
        const files = req.files;
        if (user) {
            user.photoProfil = `${domain}/assets/profile/${files.Profile[0].filename}`;
            user.photoMoto = `${domain}/assets/moto/${files.Moto[0].filename}`;
            yield user.save();
            res.status(201).json({ message: "Autres images téléchargées" });
        }
        else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nom, prenom, cin, dateNaissance, email, num, password, status } = req.body;
    const hashedPassword = yield (0, bcryptjs_1.hash)(password, 10);
    try {
        const existingUser = yield user_1.default.findOne({ email: email });
        if (existingUser) {
            res
                .status(401)
                .json({ message: "Utilisateur avec meme mail existe déja" });
        }
        else {
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
            console.log(token);
            res.status(201).json({ token: token });
        }
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
router.post("/changePassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    try {
        const user = yield user_1.default.findOne({ email: email });
        const hashedPassword = yield (0, bcryptjs_1.hash)(newPassword, 10);
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
