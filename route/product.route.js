import { Router } from "express";
import {
  createProduct,
  createProductRAMS,
  createProductSIZE,
  createProductWEIGHT,
  deleteMultipleProduct,
  deleteMultipleProductRAMS,
  deleteMultipleProductSIZE,
  deleteMultipleProductWEIGHT,
  deleteProduct,
  deleteProductRAMS,
  deleteProductSIZE,
  deleteProductWEIGHT,
  filter,
  getAllFeaturedProducts,
  getAllProductRAMS,
  getAllProducts,
  getAllProductsByCatId,
  getAllProductsByCatName,
  getAllProductsByPrice,
  getAllProductsByRating,
  getAllProductsBySubCatId,
  getAllProductsBySubCatName,
  getAllProductsByThirdSubCatId,
  getAllProductsByThirdSubCatName,
  getAllProductsCount,
  getAllProductSIZE,
  getAllProductWEIGHT,
  getProduct,
  getProductRam,
  getProductSIZE,
  getProductWEIGHT,
  removeImageFromCloudinary,
  searchProduct,
  sortBy,
  updateProduct,
  updateProductRAMS,
  updateProductSIZE,
  updateProductWEIGHT,
  uploadBannerImages,
  uploadImages,
} from "../controllers/product.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const productRouter = Router();

productRouter
  .put("/uploadImages", auth, upload.array("images"), uploadImages)
  .put("/uploadBannerImages", auth, upload.array("images"), uploadBannerImages)
  .post("/create", auth, createProduct)
  .get("/getAllProducts", getAllProducts)
  .get("/getAllProductsByCatId/:id", getAllProductsByCatId)
  .get("/getAllProductsByCatName", getAllProductsByCatName)
  .get("/getAllProductsBySubCatId/:id", getAllProductsBySubCatId)
  .get("/getAllProductsBySubCatName", getAllProductsBySubCatName)
  .get("/getAllProductsByThirdLevelCatId/:id", getAllProductsByThirdSubCatId)
  .get("/getAllProductsByThirdLevelCatName", getAllProductsByThirdSubCatName)
  .get("/getAllProductsByPrice", getAllProductsByPrice)
  .get("/getAllProductsByRating", getAllProductsByRating)
  .get("/getAllProductsCount", getAllProductsCount)
  .get("/getAllFeaturedProducts", getAllFeaturedProducts)
  .delete("/deleteMultiple", deleteMultipleProduct)
  .delete("/deleteImage", auth, removeImageFromCloudinary)
  .post("/search", searchProduct)
  .delete("/:id", deleteProduct)
  .get("/:id", getProduct)
  .put("/:id", auth, updateProduct)
  .post("/productRAMS/create", auth, createProductRAMS)
  .delete("/productRAMS/deleteMultiple", auth, deleteMultipleProductRAMS)
  .delete("/productRAMS/:id", auth, deleteProductRAMS)
  .get("/productRAMS/all", auth, getAllProductRAMS)
  .get("/productRAMS/:id", auth, getProductRam)
  .put("/productRAMS/:id", auth, updateProductRAMS)
  .post("/productWEIGHT/create", auth, createProductWEIGHT)
  .delete("/productWEIGHT/deleteMultiple", auth, deleteMultipleProductWEIGHT)
  .delete("/productWEIGHT/:id", auth, deleteProductWEIGHT)
  .get("/productWEIGHT/all", auth, getAllProductWEIGHT)
  .get("/productWEIGHT/:id", auth, getProductWEIGHT)
  .put("/productWEIGHT/:id", auth, updateProductWEIGHT)
  .post("/productSIZE/create", auth, createProductSIZE)
  .delete("/productSIZE/deleteMultiple", auth, deleteMultipleProductSIZE)
  .delete("/productSIZE/:id", auth, deleteProductSIZE)
  .get("/productSIZE/all", auth, getAllProductSIZE)
  .get("/productSIZE/:id", auth, getProductSIZE)
  .put("/productSIZE/:id", auth, updateProductSIZE)
  .post("/filters", filter)
  .post("/sortBy", sortBy);

export default productRouter;
