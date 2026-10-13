import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const generateRefreshToken = async (userId) => {
  try {
    const token = jwt.sign(
      { id: userId },
      process.env.SECRET_KEY_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    await UserModel.updateOne(
      { _id: userId },
      { $set: { refresh_token: token } }
    );

    return token;
  } catch (err) {
    console.error("Error generating refresh token:", err);
    return null;
  }
};

export default generateRefreshToken;
