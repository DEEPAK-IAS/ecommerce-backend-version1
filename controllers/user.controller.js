import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import errorHandler from "../utils/errorHandler.js";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/VerifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ReviewModel from "../models/review.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

export async function registerUserController(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(errorHandler("400", "provide email, name, password"));
    }

    const user = await UserModel.findOne({ email: email });



    if (user) {
      return next(
        errorHandler("400", "User already Registered with this email")
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      otp: verifyCode,
      otpExpires: Date.now() + 600000,
    });

    await newUser.save();

    const verifyEmail = await sendEmailFun({
      to: email,
      subject: "Verify email from Ecommerce App",
      text: "",
      html: VerificationEmail(name, verifyCode),
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      error: false,
      message: "User registered successfully! Please verify your email.",
      token: token,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return next(errorHandler("404", "Invalid code"));
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Email verified successfully.",
        error: false,
      });
    } else if (!isCodeValid) {
      return next(errorHandler("400", "Invalid OTP"));
    } else {
      return next(errorHandler("400", "OTP expired"));
    }
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return next(errorHandler("400", "User not registered"));
    }

    if (user.status !== "Active") {
      return next(errorHandler("400", "Contact to admin.."));
    }

    if (user.verify_email !== true) {
      return next(
        errorHandler("400", "Your Email is not verified yet please verified")
      );
    }

    const checkPassword = bcryptjs.compareSync(password, user.password);

    if (!checkPassword) {
      return next(errorHandler("400", "check your password"));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutUser(req, res, next) {
  try {
    const userId = req.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return res.json({
      message: "Logout successfully..",
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

// image upload
var imagesArr = [];
export async function userAvatarController(req, res, next) {
  try {
    imagesArr = [];

    const userId = req.userId;
    const images = req.files;

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return next(errorHandler("400", "User not found"));
    }

    // first remove the image form cloud

    if (user.avatar) {
      const imgUrl = user.avatar;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];

      const imageName = image.split(".")[0];

      const response = await cloudinary.uploader.destroy(imageName);
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images?.length; i++) {
      try {
        const result = await cloudinary.uploader.upload(
          images[i].path,
          options
        );
        imagesArr.push(result.secure_url);
      } finally {
        fs.unlink(images[i].path, () => {});
      }
    }

    user.avatar = imagesArr[0];
    await user.save();

    console.log(imagesArr[0]);

    return res.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function removeImageFromCloudinary(req, res, next) {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    const response = await cloudinary.uploader.destroy(imageName);

    if (response) {
      res.status(200).send(response);
    }
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function updateUserDetails(req, res, next) {
  try {
    const userId = req.userId;
    const { name, email, password, mobile } = req.body;

    const userExist = await UserModel.findById(userId);

    let verifyCode = "";

    if (email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    let hashPassword = "";

    if (password) {
      const salt = bcryptjs.genSaltSync(10);
      hashPassword = bcryptjs.hashSync(password, salt);
    } else {
      hashPassword = userExist.password;
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: req.body.email || userExist.email,
        verify_email: email ? false : true,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: verifyCode !== "" ? Date.now() + 600000 : "",
      },
      { new: true }
    );

    // await sendEmailFun({
    //   to: email,
    //   subject: "Verify email from Ecommerce App",
    //   text: "",
    //   html: VerificationEmail(name, verifyCode),
    // });

    return res.json({
      message: "User updated successfully..",
      error: false,
      success: true,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        avatar: updateUser?.avatar,
      },
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return next(errorHandler("400", "Email not available"));
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      forgot_password_otp: verifyCode,
      forgot_password_expiry: Date.now() + 600000,
    });

    await sendEmailFun({
      to: email,
      subject: "Verify email from Ecommerce App",
      text: "",
      html: VerificationEmail(user?.name, verifyCode),
    });

    return res.json({
      message: "check your email",
      error: false,
      success: true,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function verifyForgotPasswordOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return next(errorHandler("400", "Email not available"));
    }

    if (!email || !otp) {
      return next(errorHandler("400", "Provide required field email , otp"));
    }

    if (otp !== user.forgot_password_otp) {
      return next(errorHandler("400", "Invalid OTP"));
    }

    const currentTime = new Date();

    if (user.forgot_password_expiry < currentTime) {
      return next(errorHandler("400", "OTP has been Expires"));
    }

    user.forgot_password_otp = "";
    user.forgot_password_expiry = "";
    user.forgot_password_otp_verified = true;

    await user.save();

    return res.json({
      message: "OTP Verified",
      error: false,
      success: true,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return next(errorHandler("400", "Email not available"));
    }

    if (newPassword !== confirmPassword) {
      return next(
        errorHandler("400", "newPassword and confirmPassword must be same")
      );
    }

    if (user.forgot_password_otp_verified !== true) {
      return next(errorHandler("400", "OTP not verified"));
    }

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hashSync(newPassword, salt);

    user.password = hashedPassword;
    user.forgot_password_otp_verified = false;
    await user.save();

    return res.json({
      message: "password changed successfully...",
      error: false,
      success: true,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function refreshToken(req, res, next) {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req?.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
      return next(errorHandler("401", "Invalid token"));
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    if (!verifyToken) {
      return next(errorHandler("401", "token is expired"));
    }

    const userId = verifyToken?.id;

    const newAccessToken = await generateAccessToken(userId);

    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", newAccessToken, cookieOption);

    return res.json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function userDetails(req, res, next) {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select(
      "-password -refresh_token"
    );

    return res.json({
      message: "user details",
      data: user,
      error: false,
      success: true,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function authWithGoogle(req, res, next) {
  try {
    const { name, email, password, mobile, avatar, signUpWithGoogle, role } =
      req.body;

    let user = await UserModel.findOne({ email });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = await generateRefreshToken(user._id);

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      res.cookie("accessToken", accessToken, cookiesOption);
      res.cookie("refreshToken", refreshToken, cookiesOption);

      return res.status(200).json({
        message: "User logged in successfully",
        success: true,
        error: false,
        accessToken,
        refreshToken,
        user,
      });
    }

    user = new UserModel({
      name,
      email,
      password: password || null,
      mobile: mobile || null,
      avatar,
      signUpWithGoogle: signUpWithGoogle ?? true,
      verify_email: true,
      role: role || "USER",
    });

    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.status(200).json({
      message: "User registered and logged in successfully",
      success: true,
      error: false,
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    console.error(" Google Auth Error:", err);
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message,
    });
  }
}

export async function addReview(req, res, next) {
  try {
    const userReview = new ReviewModel({
      image: req.body.image,
      userName: req.body.userName,
      userId: req.body.userId,
      rating: req.body.rating,
      review: req.body.review,
      productId: req.body.productId,
    });

    await userReview.save();

    return res.status(200).json({
      message: "review added successfully...",
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReviews(req, res, next) {
  try {
    const productId = req.params.productId;

    const reviews = await ReviewModel.find({ productId: productId });

    return res.status(200).json({
      error: false,
      success: true,
      reviews: reviews,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllReviews(req, res, next) {
  try {
    const reviews = await ReviewModel.find();

    if (!reviews) {
      return next(errorHandler("400", "reviews not found..."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      reviews: reviews,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllUser(req, res, next) {
  try {
    const users = await UserModel.find();
    if (!users) {
      return next(errorHandler("400", "users not found..."));
    }

    return res.status(200).json({
      error: false,
      success: true,
      users: users,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserController(req, res, next) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(
        errorHandler("400", "Provide at least one user ID to delete")
      );
    }

    const result = await UserModel.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return next(errorHandler("404", "No users found to delete"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: `${result.deletedCount} user(s) deleted successfully`,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}
