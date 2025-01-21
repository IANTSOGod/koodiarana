import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";

configDotenv({path:".env"});

const societyEmail=process.env.SOCIETY_EMAIL;
const societyPassword=process.env.SOCIETY_PASSWORD;

export const transporter = nodemailer.createTransport({
  service: "gmail", // Ou un autre service : 'hotmail', 'yahoo', etc.
  auth: {
    user: societyEmail, // Remplacez par votre email
    pass: societyPassword,   // Mot de passe ou App Password
  },
});

// Vérifier la connexion au service de messagerie
transporter.verify((error, success) => {
  if (error) {
    console.error("Erreur Nodemailer :", error);
  } else {
    console.log("Nodemailer prêt !");
  }
});
