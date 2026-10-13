import { Router } from "express";
const BlogRouter = Router();
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  createBlog,
  deleteBlog,
  deleteMultipleBlogs,
  getAllBlogs,
  getBlog,
  removeImageFromCloudinary,
  updateBlog,
  uploadImages,
} from "../controllers/blog.controller.js";

BlogRouter.put("/uploadImages", auth, upload.array("images"), uploadImages)
  .post("/create", auth, createBlog)
  .get("/", getAllBlogs)
  .get("/:id", auth, getBlog)
  .delete("/deleteImage", auth, removeImageFromCloudinary)
  .delete("/deleteMultiple", auth, deleteMultipleBlogs)
  .delete("/:id", auth, deleteBlog)
  .put("/:id", auth, updateBlog);

  export default BlogRouter