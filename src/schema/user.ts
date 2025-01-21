import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nom:{
      type: String,
      required: true,
    },
    prenom:{
      type: String,
      required: true,
    },
    dateNaissance:{
      type: Date,
      required: true,
    },
    email:{
      type: String,
      required: true,
      unique: true,
    },
    num:{
      type: String,
      required: true,
    },
    password:{
      type: String,
      required: true,
    },
    emailVerified:{ 
      type: Boolean,
      default: false,
    },
    status:{
      type: Boolean,
      required: true,
    }
  },
  {
    collection: "User",
  }
);

// Créer un modèle à partir du schéma
const User = mongoose.model("User", userSchema);

export default User;
