import { Router, Request, Response } from "express";
import { transporter } from "../config/mailer";
import { generateToken, verifyToken } from "../config/jwt";
import { configDotenv } from "dotenv";
import { generateOtp } from "../config/Otp";

configDotenv({ path: ".env" });

const router = Router();

router.post("/send", async (req: Request, res: Response) => {
  const { to, subject, text } = req.body;
  const societyEmail = process.env.SOCIETY_EMAIL;

  const mailOptions = {
    from: societyEmail, // Adresse email de l'expéditeur
    to: to, // Adresse email du destinataire
    subject: subject, // Sujet de l'email
    text: text, // Texte brut
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/sendVerificationLink", async (req: Request, res: Response) => {
  const { token } = req.body;
  const payload = verifyToken(token) as { email: string };
  const societyEmail = process.env.SOCIETY_EMAIL;
  try {
    const mailOptions = {
      from: societyEmail, // Adresse email de l'expéditeur
      to: payload.email, // Adresse email du destinataire
      subject: "Email verification", // Sujet de l'email
      text: `Voici le lien de vérification de compte http://localhost:3000/users/verifyEmail/${token}`, // Texte brut
    };
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/sendOTP", async (req: Request, res: Response) => {
  const { email } = req.body;
  const societyEmail = process.env.SOCIETY_EMAIL;
  try {
    const otp = generateOtp();
    const mailOptions = {
      from: societyEmail, // Adresse email de l'expéditeur
      to: email,
      subject: "OTP by koodiarana",
      text: "Votre code OTP est " + otp,
    };
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé" });
  } catch (error) {
    res.status(500).json(error);
  }
});



export default router;
