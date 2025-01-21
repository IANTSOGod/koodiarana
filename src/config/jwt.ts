import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

configDotenv({ path: ".env" });

const key= process.env.JWT_SECRET as string; 

export const generateToken = (email: string): string => {
  return jwt.sign({ email }, key, { expiresIn: "1h" });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, key);
};
