import { Router, Response, Request } from "express";
import User from "../schema/user";
import { compare } from "bcrypt";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      const isPasswordValid = await compare(password, user.password);
      if (isPasswordValid) {
        if (user.emailVerified) {
          res.status(200).json({ message: "Login success" });
        } else {
          res.status(401).json({ message: "Email non vérifié" });
        }
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});


export default router;
