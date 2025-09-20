import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";

configDotenv({path:".env"});

const societyEmail=process.env.SOCIETY_EMAIL;
const societyPassword=process.env.SOCIETY_PASSWORD;


export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, 
  auth: {
    user: societyEmail, 
    pass: societyPassword,   
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Erreur Nodemailer :", error);
  } else {
    console.log("Nodemailer prêt !");
  }
});
