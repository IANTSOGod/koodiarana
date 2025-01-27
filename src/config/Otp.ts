import { configDotenv } from "dotenv";
import { totp } from "otplib";

configDotenv({ path: ".env" });

totp.options = {
  digits: 6, // Nombre de chiffres pour l'OTP
  step: 300,
};

const secret = process.env.OTP_SECRET as string;

export const generateOtp = () => {
  return totp.generate(secret);
};

export const verifyOtp = (otp: string) => {
  return totp.check(otp, secret);
};
