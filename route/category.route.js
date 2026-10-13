import {
  createCategory,
  deleteCategory,
  deleteMultipleCategory,
  getCategories,
  getCategoriesCount,
  getCategory,
  getSubCategoriesCount,
  removeImageFromCloudinary,
  updateCategory,
  uploadImages,
} from "../controllers/category.controller.js";

import { Router } from "express";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";

const categoryRouter = Router();

categoryRouter
  .put("/uploadImages", auth, upload.array("images"), uploadImages)
  .post("/create", auth, createCategory)
  .get("/",getCategories)
  .get("/get/count",auth,getCategoriesCount)
  .get("/get/count/subCat", auth, getSubCategoriesCount)
  .get("/:id",auth, getCategory)
  .delete("/deleteMultiple", auth,deleteMultipleCategory)
  .delete("/deleteImage",auth,removeImageFromCloudinary)
  .delete("/:id",auth, deleteCategory)
  .put("/:id",auth,updateCategory)

export default categoryRouter;
