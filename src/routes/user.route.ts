import { Router, Request, Response } from "express";
import User from "../schema/user";
import { hash } from "bcrypt";
import { generateToken, verifyToken } from "../config/jwt";

const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  const { nom, prenom, dateNaissance, email, num, password, status } = req.body;
  const hashedPassword = await hash(password, 10);
  try {
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

export default router;
