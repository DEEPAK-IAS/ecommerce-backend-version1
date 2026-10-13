import { Router } from "express";
import {
  registerUserController,
  verifyEmail,
  loginUser,
  logoutUser,
  userAvatarController,
  removeImageFromCloudinary,
  updateUserDetails,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  refreshToken,
  userDetails,
  authWithGoogle,
  addReview,
  getReviews,
  getAllUser,
  getAllReviews,
  deleteUserController,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();

userRouter
  .post("/register", registerUserController)
  .post("/verifyEmail", verifyEmail)
  .post("/authWithGoogle", authWithGoogle)
  .post("/login", loginUser)
  .get("/logout", auth, logoutUser)
  .put("/user-avatar", auth, upload.array("avatar"), userAvatarController)
  .delete("/deleteImage", auth, removeImageFromCloudinary)
  .put("/:id", auth, updateUserDetails)
  .post("/forgot-password", forgotPassword)
  .post("/verify-forgot-password-otp", verifyForgotPasswordOTP)
  .post("/reset-password", resetPassword)
  .post("/refresh-token", refreshToken)
  .get("/user-details", auth, userDetails)
  .post("/add-review", auth, addReview)
  .get("/getAllReviews/:productId", getReviews)
  .get("/getAllUsers", auth, getAllUser)
  .get("/getAllReviews", getAllReviews)
  .delete("/deleteUsers", deleteUserController);

export default userRouter;
