import { Router, Request, Response } from "express";
import User from "../schema/user";
import { hash } from "bcryptjs";
import { generateToken, verifyToken } from "../config/jwt";
import { verifyOtp } from "../config/Otp";
import multer from "multer";
import path from "path";
import { configDotenv } from "dotenv";

const router = Router();
configDotenv({ path: ".env" });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath = "";

    switch (file.fieldname) {
      case "CIN1":
        folderPath = path.join(__dirname, "../assets/cinFront");
        break;
      case "CIN2":
        folderPath = path.join(__dirname, "../assets/cinBack");
        break;
      case "Profile":
        folderPath = path.join(__dirname, "../assets/profile");
        break;
      case "Moto":
        folderPath = path.join(__dirname, "../assets/moto");
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

const upload = multer({ storage });

const domain = process.env.DOMAIN_NAME;

router.post(
  "/uploadCIN",
  upload.fields([
    { name: "CIN1", maxCount: 1 },
    { name: "CIN2", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email });
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (user) {
        user.photoCIN1 = `${domain}/assets/cinFront/${files.CIN1[0].filename}`;
        user.photoCIN2 = `${domain}/assets/cinFront/${files.CIN2[0].filename}`;
        await user.save();
        res.status(201).json({ message: "Images CIN téléchargées" });
      } else {
        res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

router.post(
  "/uploadOthers",
  upload.fields([
    { name: "Profile", maxCount: 1 },
    { name: "Moto", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email });
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (user) {
        user.photoProfil = `${domain}/assets/profile/${files.Profile[0].filename}`;
        user.photoMoto = `${domain}/assets/moto/${files.Moto[0].filename}`;
        await user.save();
        res.status(201).json({ message: "Autres images téléchargées" });
      } else {
        res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);
router.post("/create", async (req: Request, res: Response) => {
  const { nom, prenom,cin, dateNaissance, email, num, password, status } = req.body;
  const hashedPassword = await hash(password, 10);
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res
        .status(401)
        .json({ message: "Utilisateur avec meme mail existe déja" });
    } else {
      const newUser = new User({
        nom: nom,
        prenom: prenom,
        dateNaissance: dateNaissance,
        email: email,
        num: num,
        password: hashedPassword,
        status: status,
      });
      const newUserDoc = await newUser.save();
      const token = generateToken(newUserDoc.email);
      console.log(token);
      res.status(201).json({ token: token });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/verifyEmail/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  try {
    const payload = verifyToken(token) as { email: string };
    if (payload) {
      const user = await User.findOne({
        email: payload.email,
      });
      if (user) {
        user.emailVerified = true;
        await user.save();
        res.status(200).json({ message: "Email vérifié" });
      } else {
        res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    } else {
      res.status(401).json({ message: "Token invalide" });
    } // Mettre à jour le statut de vérification
  } catch (error) {
    res.status(400).json({ message: "Token invalide ou expiré" });
  }
});

router.post("/verifyOTP", async (req: Request, res: Response) => {
  const { otp } = req.body;
  try {
    const isVerified = verifyOtp(otp);
    if (isVerified) {
      res.status(200).json({ message: "OTP vérifié" });
    } else {
      res.status(401).json({ message: "OTP invalide" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/changePassword", async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: email });
    const hashedPassword = await hash(newPassword, 10);
    if (user) {
      user.password = hashedPassword;
      await user?.save();
      res.status(200).json({ message: "Mot de passe réinitialisé" });
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
