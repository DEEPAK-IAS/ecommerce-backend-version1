import ProductModel from "../models/product.model.js";
import errorHandler from "../utils/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";
import productRamsModel from "../models/productRam.model.js";
import productWEIGHTModel from "../models/productWEIGHT.model.js";
import productSizeModel from "../models/productSize.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];
export async function uploadImages(req, res, next) {
  try {
    imagesArr = [];
    const images = req.files;

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

    return res.status(200).json({
      images: imagesArr,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

var bannerImages = [];
export async function uploadBannerImages(req, res, next) {
  try {
    bannerImages = [];
    const images = req.files;

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
        bannerImages.push(result.secure_url);
      } finally {
        fs.unlink(images[i].path, () => {});
      }
    }

    return res.status(200).json({
      images: bannerImages,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function createProduct(req, res, next) {
  try {
    let product = new ProductModel({
      name: req.body.name,
      description: req.body.description,
      images: imagesArr.length > 0 ? imagesArr : req.body.images,
      bannerImages:
        bannerImages.length > 0 ? bannerImages : req.body.bannerImages,
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      catName: req.body.catName,
      catId: req.body.catId,
      subCatId: req.body.subCatId,
      subCat: req.body.subCat,
      thirdSubCat: req.body.thirdSubCat,
      thirdLevelCatId: req.body.thirdLevelCatId,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRams: req.body.productRams,
      size: req.body.size,
      productWeight: req.body.productWeight,
      location: req.body.location,
      dateCreated: req.body.dateCreated,
      category: req.body.category,
      bannerTitleName: req.body.bannerTitleName,
      isDisplayOnHomeBanner: req.body.isDisplayOnHomeBanner,
    });

    await product.save();
    if (!product) {
      return next(errorHandler("500", "product not created"));
    }

    imagesArr = [];
    bannerImages = [];

    return res.status(200).json({
      message: "product created successfully...",
      error: false,
      success: true,
      product: product,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function getAllProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await ProductModel.find()
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by category Id
export async function getAllProductsByCatId(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments({ catId: req.params.id });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await ProductModel.find({ catId: req.params.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by category name
export async function getAllProductsByCatName(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments({ catName: req.query.catName });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await ProductModel.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by sub category id
export async function getAllProductsBySubCatId(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments({
      subCatId: req.params.id,
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModel.find({ subCatId: req.params.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec();

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found in this subcategory",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by sub category name
export async function getAllProductsBySubCatName(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments({
      $or: [
        { subCat: req.query.subCatName },
        { subCatName: req.query.subCatName },
      ],
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await ProductModel.find({
      $or: [
        { subCat: req.query.subCatName },
        { subCatName: req.query.subCatName },
      ],
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}
// get all products by third sub category id
export async function getAllProductsByThirdSubCatId(req, res, next) {
  try {
    const { id } = req.params;

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments({ thirdLevelCatId: id });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModel.find({ thirdLevelCatId: id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec();

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found in this third subcategory",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by third sub category name
export async function getAllProductsByThirdSubCatName(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments({
      $or: [
        { thirdSubCat: req.query.thirdSubCatName },
        { thirdSubCatName: req.query.thirdSubCatName },
      ],
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await ProductModel.find({
      $or: [
        { thirdSubCat: req.query.thirdSubCatName },
        { thirdSubCatName: req.query.thirdSubCatName },
      ],
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by price
export async function getAllProductsByPrice(req, res, next) {
  try {
    let productList = [];

    if (req.query.catId !== "" && req.query.catId !== undefined) {
      const productListArr = await ProductModel.find({
        catId: req.query.catId,
      }).populate("category");

      productList = productListArr;
    }
    if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
      const productListArr = await ProductModel.find({
        subCatId: req.query.subCatId,
      }).populate("category");

      productList = productListArr;
    }

    if (req.query.thirdSubCat !== "" && req.query.thirdSubCat !== undefined) {
      const productListArr = await ProductModel.find({
        thirdSubCat: req.query.thirdSubCat,
      }).populate("category");

      productList = productListArr;
    }

    const filteredProducts = productList.filter((product) => {
      if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
        return false;
      }
      if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
        return false;
      }
      return true;
    });

    return res.status(200).json({
      productList: filteredProducts,
      totalPages: 0,
      page: 0,
      success: true,
      error: false,
    });
  } catch (err) {
    next(err);
  }
}

// get all products by rating
export async function getAllProductsByRating(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const filter = {};

    if (req.query.rating) filter.rating = req.query.rating;
    if (req.query.catId) filter.catId = req.query.catId;
    if (req.query.subCatId) filter.subCatId = req.query.subCatId;
    if (req.query.thirdSubCatId) filter.thirdLevelCatId = req.query.thirdSubCatId;

    const totalPosts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModel.find(filter)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

//get all product count
export async function getAllProductsCount(req, res, next) {
  try {
    const productCount = await ProductModel.countDocuments();

    if (!productCount) {
      return next(errorHandler("500", "not products found"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      productCount: productCount,
    });
  } catch (err) {
    next(err);
  }
}

// get all featured products
export async function getAllFeaturedProducts(req, res, next) {
  try {
    const products = await ProductModel.find({ isFeatured: true }).populate(
      "category"
    );

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
    });
  } catch (err) {
    next(err);
  }
}

// delete products
export async function deleteProduct(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "category"
    );
    if (!product) {
      return next(errorHandler("404", "product not found"));
    }

    const images = product.images;

    for (let img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];

      const imageName = image.split(".")[0];

      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {});
      }
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return next(errorHandler("404", "product not found..."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "product deleted successfully...",
    });
  } catch (err) {
    next(err);
  }
}

// delete multiple products
export async function deleteMultipleProduct(req, res, next) {
  try {
    const { ids } = req.body;
    console.log(ids);
    if (!ids || !Array.isArray(ids)) {
      return next(errorHandler("400", "Invalid input"));
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return next(errorHandler("400", "No valid product IDs provided"));
    }

    for (const id of validIds) {
      const product = await ProductModel.findById(id);
      if (!product) continue;

      for (const imgUrl of product.images) {
        const parts = imgUrl.split("/");
        const imageFile = parts[parts.length - 1].split(".")[0];
        if (imageFile) {
          await cloudinary.uploader.destroy(imageFile);
        }
      }
    }

    await ProductModel.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      message: "Products deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

// get specific product
export async function getProduct(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "category"
    );

    if (!product) {
      return next(errorHandler("404", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (err) {
    next(err);
  }
}

// delete images
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
    next(err);
  }
}

// update products
export async function updateProduct(req, res, next) {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: imagesArr.length > 0 ? imagesArr : req.body.images,
        bannerImages:
          bannerImages.length > 0 ? bannerImages : req.body.bannerImages,
        brand: req.body.brand,
        price: req.body.price,
        oldPrice: req.body.oldPrice,
        catName: req.body.catName,
        catId: req.body.catId,
        subCatId: req.body.subCatId,
        subCat: req.body.subCat,
        thirdSubCat: req.body.thirdSubCat,
        thirdLevelCatId: req.body.thirdLevelCatId,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        discount: req.body.discount,
        productRams: req.body.productRams,
        size: req.body.size,
        productWeight: req.body.productWeight,
        location: req.body.location,
        dateCreated: req.body.dateCreated,
        bannerTitleName: req.body.bannerTitleName,
        isDisplayOnHomeBanner: req.body.isDisplayOnHomeBanner,
      },
      { new: true }
    );

    if (!product) {
      return next(errorHandler("404", "product cannot be updated"));
    }

    imagesArr = [];
    bannerImages = [];

    return res.status(200).json({
      message: "the product is updated",
      status: true,
      error: false,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProductRAMS(req, res, next) {
  try {
    let productRAM = new productRamsModel({
      name: req.body.name,
    });
    productRAM = await productRAM.save();

    if (!productRAM) {
      return next(errorHandler("500", "productRam not created"));
    }

    return res.status(200).json({
      message: "product Ram created successfully..",
      error: false,
      success: true,
      product: productRAM,
    });
  } catch (err) {
    next(err);
  }
}

// delete products
export async function deleteProductRAMS(req, res, next) {
  try {
    const productRAMS = await productRamsModel.findById(req.params.id);
    if (!productRAMS) {
      return next(errorHandler("404", "item not found"));
    }

    const deletedProductRAMS = await productRamsModel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProductRAMS) {
      return next(errorHandler("404", "item not found..."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "product RAM deleted successfully...",
    });
  } catch (err) {
    next(err);
  }
}

// delete multiple products
export async function deleteMultipleProductRAMS(req, res, next) {
  try {
    const { ids } = req.body;
    console.log(ids);
    if (!ids || !Array.isArray(ids)) {
      return next(errorHandler("400", "Invalid input"));
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return next(errorHandler("400", "No valid product IDs provided"));
    }

    await productRamsModel.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      message: "Products RAMS deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductRam(req, res, next) {
  try {
    const product = await productRamsModel.findById(req.params.id);

    if (!product) {
      return next(errorHandler("404", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllProductRAMS(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await productRamsModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await productRamsModel
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProductRAMS(req, res, next) {
  try {
    const product = await productRamsModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!product) {
      return next(errorHandler("404", "product Ram cannot be updated"));
    }

    return res.status(200).json({
      message: "product rams updated...",
      status: true,
      error: false,
    });
  } catch (err) {
    next(err);
  }
}

// weight
export async function createProductWEIGHT(req, res, next) {
  try {
    let productWEIGHT = new productWEIGHTModel({
      name: req.body.name,
    });
    productWEIGHT = await productWEIGHT.save();

    if (!productWEIGHT) {
      return next(errorHandler("500", "productWEIGHT not created"));
    }

    return res.status(200).json({
      message: "product Ram created successfully..",
      error: false,
      success: true,
      product: productWEIGHT,
    });
  } catch (err) {
    next(err);
  }
}

// delete products
export async function deleteProductWEIGHT(req, res, next) {
  try {
    const productWEIGHTS = await productWEIGHTModel.findById(req.params.id);
    if (!productWEIGHTS) {
      return next(errorHandler("404", "item not found"));
    }

    const deletedProductWEIGHT = await productWEIGHTModel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProductWEIGHT) {
      return next(errorHandler("404", "item not found..."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "product WEIGHT deleted successfully...",
    });
  } catch (err) {
    next(err);
  }
}

// delete multiple products
export async function deleteMultipleProductWEIGHT(req, res, next) {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return next(errorHandler("400", "Invalid input"));
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return next(errorHandler("400", "No valid product IDs provided"));
    }

    await productWEIGHTModel.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      message: "Products WEIGHTS deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductWEIGHT(req, res, next) {
  try {
    const product = await productWEIGHTModel.findById(req.params.id);

    if (!product) {
      return next(errorHandler("404", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllProductWEIGHT(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await productWEIGHTModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await productWEIGHTModel
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProductWEIGHT(req, res, next) {
  try {
    const product = await productWEIGHTModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!product) {
      return next(errorHandler("404", "product WEIGHT cannot be updated"));
    }

    return res.status(200).json({
      message: "product WEIGHT updated...",
      status: true,
      error: false,
    });
  } catch (err) {
    next(err);
  }
}

// Size
export async function createProductSIZE(req, res, next) {
  try {
    let productWEIGHT = new productSizeModel({
      name: req.body.name,
    });
    productWEIGHT = await productWEIGHT.save();

    if (!productWEIGHT) {
      return next(errorHandler("500", "productSize not created"));
    }

    return res.status(200).json({
      message: "product Size created successfully..",
      error: false,
      success: true,
      product: productWEIGHT,
    });
  } catch (err) {
    next(err);
  }
}

// delete products
export async function deleteProductSIZE(req, res, next) {
  try {
    const productSIZE = await productSizeModel.findById(req.params.id);
    if (!productSIZE) {
      return next(errorHandler("404", "item not found"));
    }

    const deletedProductSIZE = await productSizeModel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProductSIZE) {
      return next(errorHandler("404", "item not found..."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "product SIZE deleted successfully...",
    });
  } catch (err) {
    next(err);
  }
}

// delete multiple products
export async function deleteMultipleProductSIZE(req, res, next) {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return next(errorHandler("400", "Invalid input"));
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return next(errorHandler("400", "No valid product IDs provided"));
    }

    await productSizeModel.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      message: "Products size deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductSIZE(req, res, next) {
  try {
    const product = await productSizeModel.findById(req.params.id);

    if (!product) {
      return next(errorHandler("404", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllProductSIZE(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await productSizeModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }
    const products = await productSizeModel
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return next(errorHandler("500", "product not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProductSIZE(req, res, next) {
  try {
    const product = await productSizeModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!product) {
      return next(errorHandler("404", "product size cannot be updated"));
    }

    return res.status(200).json({
      message: "product size updated...",
      status: true,
      error: false,
    });
  } catch (err) {
    next(err);
  }
}

export async function filter(req, res, next) {
  try {
    const {
      catId,
      subCatId,
      thirdLevelCatId,
      minPrice,
      maxPrice,
      rating,
      page,
      limit,
    } = req.body;

    let filters = {};

    if (catId.length) {
      filters.catId = { $in: catId };
    }
    if (subCatId.length) {
      filters.subCatId = { $in: subCatId };
    }
    if (thirdLevelCatId.length) {
      filters.thirdLevelCatId = { $in: thirdLevelCatId };
    }
    if (minPrice || maxPrice) {
      filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
    }
    if (rating.length) {
      filters.rating = { $in: rating };
    }

    const products = await ProductModel.find(filters)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ProductModel.countDocuments(filters);

    return res.status(200).json({
      success: true,
      error: false,
      products: products,
      total: total,
      page: parseInt(page),
      totalPage: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

const sortItems = (products, sortBy, order) => {
  return products.sort((a, b) => {
    if (sortBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    if (sortBy === "price") {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    }

    return 0;
  });
};

export async function sortBy(req, res, next) {
  try {
    const { products, sortBy, order } = req.body;

    const sortedItems = sortItems([...products], sortBy, order);

    return res.status(200).json({
      success: true,
      error: false,
      products: sortedItems,
      page: 0,
      totalPage: 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function searchProduct(req, res, next) {
  try {
    const { query, page, limit } = req.body;

    if (!query) {
      return next(errorHandler("400", "Query is required..."));
    }

    // Build search conditions
    const conditions = [
      { name: { $regex: query, $options: "i" } },
      { brand: { $regex: query, $options: "i" } },
      { catName: { $regex: query, $options: "i" } },
      { subCat: { $regex: query, $options: "i" } },
      { thirdSubCat: { $regex: query, $options: "i" } },
    ];

    // Only add _id search if query is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(query)) {
      conditions.push({ _id: query });
    }

    const items = await ProductModel.find({ $or: conditions })
      .populate("category")
     

    const total = items?.length;

    return res.status(200).json({
      error: false,
      success: true,
      products: items,
      total: total,
      page: parseInt(page),
      totalPage: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}
