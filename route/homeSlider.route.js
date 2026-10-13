import { Router } from "express";
const HomeSliderRouter = Router();
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  createHomeSlider,
  deleteMultipleSlides,
  deleteSlide,
  getAllHomeSlide,
  getAllHomeSlides,
  removeImageFromCloudinary,
  updateSlide,
  uploadImages,
} from "../controllers/homeSlider.controller.js";

HomeSliderRouter.put(
  "/uploadImages",
  auth,
  upload.array("images"),
  uploadImages
)
  .post("/add", auth, createHomeSlider)
  .get("/", getAllHomeSlides)
  .get("/:id", auth, getAllHomeSlide)
  .delete("/deleteImage", auth, removeImageFromCloudinary)
  .delete("/deleteMultiple", auth, deleteMultipleSlides)
  .delete("/:id", auth, deleteSlide)
  .put("/:id", auth, updateSlide);

export default HomeSliderRouter;
