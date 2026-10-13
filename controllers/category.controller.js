import CategoryModel from "../models/category.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs, { access } from "fs";
import errorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

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

// create category
export async function createCategory(req, res, next) {
  try {
    let category = new CategoryModel({
      name: req.body.name,
      images: imagesArr,
      parentId: req.body.parentId,
      parentCatName: req.body.parentCatName,
    });

    if (!category) {
      return next(errorHandler("500", "category not created"));
    }

    await category.save();

    imagesArr = [];

    return res.status(200).json({
      message: "category created successfully..",
      success: true,
      error: false,
      data: category,
    });
  } catch (err) {
    next(err);
  }
}

// get categories

export async function getCategories(req, res, next) {
  try {
    const categories = await CategoryModel.find();
    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootCategories = [];

    categories.forEach((cat) => {
      if (cat.parentId) {
        categoryMap[cat.parentId]?.children.push(categoryMap[cat._id]);
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return res.status(200).json({
      error: false,
      success: true,
      data: rootCategories,
    });
  } catch (err) {
    next(err);
  }
}

//get category Count
export async function getCategoriesCount(req, res, next) {
  try {
    const categoriesCount = await CategoryModel.countDocuments({
      parentId: undefined,
    });

    if (!categoriesCount) {
      return res.status(500).json({ success: false });
    } else {
      return res.send({ categoriesCount: categoriesCount });
    }
  } catch (err) {
    next(err);
  }
}

// get sub categories count

export async function getSubCategoriesCount(req, res, next) {
  try {
    const categoryCount = await CategoryModel.find();

    if (!categoryCount) {
      res.status(500).json({ success: false });
    } else {
      const subCatList = [];
      for (let cat of categoryCount) {
        if (cat.parentId !== undefined) {
          subCatList.push(cat);
        }
      }
      return res.send({ subCategoryCount: subCatList.length });
    }
  } catch (err) {
    next(err);
  }
}

//get category...
export async function getCategory(req, res, next) {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return next(
        errorHandler("400", "The category with the given id was not found")
      );
    }

    return res.status(200).json({
      category,
    });
  } catch (err) {
    next(err);
  }
}

// delete category image
export async function removeImageFromCloudinary(req, res, next) {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    const response = await cloudinary.uploader.destroy(imageName);

    if (response) {
      res.status(200).json({
        error: false,
        success: true,
        message: "image deleted successfully...",
      });
    }
  } catch (err) {
    next(err);
  }
}

// delete category
export async function deleteCategory(req, res, next) {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return next(errorHandler("404", "Category not found"));

    // Delete images from Cloudinary
    const images = category.images || [];
    for (const imgUrl of images) {
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }

    // Delete subcategories recursively
    const subCategories = await CategoryModel.find({ parentId: req.params.id });
    for (const subCat of subCategories) {
      const thirdSubCategories = await CategoryModel.find({
        parentId: subCat._id,
      });
      for (const thirdSubCat of thirdSubCategories) {
        await CategoryModel.findByIdAndDelete(thirdSubCat._id);
      }
      await CategoryModel.findByIdAndDelete(subCat._id);
    }

    // Delete main category
    await CategoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Category Deleted..",
    });
  } catch (err) {
    next(err);
  }
}

//  update category

export async function updateCategory(req, res, next) {
  try {
    console.log(req.body);

    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: req.body.image,
        parentId: req.body.parentId,
        parentCatName: req.body.parentCatName,
      },
      { new: true }
    );

    if (!category) {
      return next(errorHandler("500", "Category cannot be updated..."));
    }

    imagesArr = [];

    return res.status(200).json({
      success: true,
      error: false,
      category: category,
      message: "Category updated...",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMultipleCategory(req, res, next) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return next(
        errorHandler(400, "Invalid input — expected an array of IDs")
      );
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return next(errorHandler(400, "No valid category IDs provided"));
    }

    const deleteCategoryRecursive = async (catId) => {
      const category = await CategoryModel.findById(catId);
      if (!category) return;

      if (Array.isArray(category.images) && category.images.length > 0) {
        await Promise.all(
          category.images.map(async (imgUrl) => {
            try {
              const parts = imgUrl.split("/");
              const fileName = parts[parts.length - 1].split(".")[0];
              if (fileName) {
                await cloudinary.uploader.destroy(fileName);
              }
            } catch (err) {
              console.warn("Failed to delete image:", imgUrl, err.message);
            }
          })
        );
      }

      const subCategories = await CategoryModel.find({ parentId: catId });
      if (subCategories.length > 0) {
        await Promise.all(
          subCategories.map((subCat) => deleteCategoryRecursive(subCat._id))
        );
      }

      await CategoryModel.findByIdAndDelete(catId);
    };

    await Promise.all(validIds.map((id) => deleteCategoryRecursive(id)));

    return res.status(200).json({
      success: true,
      error: false,
      message: "Categories deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteMultipleCategory:", err);
    next(err);
  }
}
