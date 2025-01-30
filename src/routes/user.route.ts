import { Router, Request, Response } from "express";
import User from "../schema/user";
import { hash } from "bcrypt";
import { generateToken, verifyToken } from "../config/jwt";
import { verifyOtp } from "../config/Otp";
import multer from "multer";
import path from "path";
import { configDotenv } from "dotenv";

const router = Router();
configDotenv({ path: ".env" });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Vérifie la route et définit le dossier approprié
    if (req.path === "/uploadProfilePics") {
      cb(null, path.join(__dirname, "../assets/profile"));
    } else if (req.path === "/uploadCIN1") {
      cb(null, path.join(__dirname, "../assets/cinFront"));
    } else if (req.path === "/uploadCIN2") {
      cb(null, path.join(__dirname, "../assets/cinBack"));
    } else if (req.path === "/uploadMoto") {
      cb(null, path.join(__dirname, "../assets/moto"));
    } else {
      cb(new Error("Route non valide pour l’upload"), "");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const domain = process.env.DOMAIN_NAME;

router.post(
  "/uploadProfilePics",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(404).json({ message: "Aucun fichier fournit" });
    } else {
      const { email } = req.body;
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          user.photoProfil = `${domain}/assets/profile/` + req.file.filename;
          await user.save();
          res.status(200).json({ message: "Photo de profil téléchargée" });
        }
      } catch (error) {
        res.status(500).json({ error });
      }
    }
  }
);

router.post(
  "/uploadCIN1",
  upload.single("file"),
  async (req: Request, res: Response) => {
    console.log("Tonga aty lesy laisany")

    if (!req.file) {
      console.log("Tsy tonga aty le fichier")

      res.status(404).json({ message: "Aucun fichier fournit" });
    } else {
      const { email } = req.body;
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          user.photoCIN1 = `${domain}/assets/cinFront/` + req.file.filename;
          await user.save();
          res.status(200).json({ message: "Photo de CIN avant téléchargée" });
        }
      } catch (error) {
        res.status(500).json({ error });
      }
    }
  }
);

router.post(
  "/uploadCIN2",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(404).json({ message: "Aucun fichier fournit" });
    } else {
      const { email } = req.body;
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          user.photoCIN2 = `${domain}/assets/cinBack/` + req.file.filename;
          await user.save();
          res.status(200).json({ message: "Photo de CIN apres téléchargée" });
        }
      } catch (error) {
        res.status(500).json({ error });
      }
    }
  }
);

router.post(
  "/uploadMoto",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(404).json({ message: "Aucun fichier fournit" });
    } else {
      const { email } = req.body;
      try {
        const user = await User.findOne({ email: email, status: true });
        if (user) {
          user.photoMoto = `${domain}/assets/moto/` + req.file.filename;
          await user.save();
          res.status(200).json({ message: "Photo de moto téléchargée" });
        }
      } catch (error) {
        res.status(500).json({ error });
      }
    }
  }
);

router.post("/create", async (req: Request, res: Response) => {
  const { nom, prenom, dateNaissance, email, num, password, status } = req.body;
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
