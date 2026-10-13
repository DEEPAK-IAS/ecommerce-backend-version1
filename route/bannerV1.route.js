import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createBannerV1,
  deleteBanner,
  deleteMultipleBanners,
  getBanner,
  getBanners,
  removeImageFromCloudinary,
  updateBanner,
  uploadImages,
} from "../controllers/bannerV1.controller.js";

const bannerV1Router = Router();

bannerV1Router
  .put("/uploadImages", auth, upload.array("images"), uploadImages)
  .post("/create", auth, createBannerV1)
  .get("/", getBanners)
  .get("/:id", auth, getBanner)
  .delete("/deleteMultiple", auth, deleteMultipleBanners)
  .delete("/deleteImage", auth, removeImageFromCloudinary)
  .delete("/:id", auth, deleteBanner)
  .put("/:id", auth, updateBanner);

export default bannerV1Router;
