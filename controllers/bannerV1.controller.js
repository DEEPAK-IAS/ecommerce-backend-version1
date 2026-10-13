import errorHandler from "../utils/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";
import BannerV1Model from "../models/bannerV1.model.js";

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

export async function createBannerV1(req, res, next) {
  try {
    let banner = new BannerV1Model({
      title: req.body.title,
      category: req.body.category,
      catId: req.body.catId,
      subCatId: req.body.subCatId,
      subCat: req.body.subCat,
      thirdSubCat: req.body.thirdSubCat,
      thirdLevelCatId: req.body.thirdLevelCatId,
      price: req.body.price,
      align: req.body.align,
      image: imagesArr.length > 0 ? imagesArr : req.body.image,
    });

    await banner.save();
    if (!banner) {
      return next(errorHandler("500", "banner not created"));
    }

    imagesArr = [];

    return res.status(200).json({
      message: "bannerV1 created successfully...",
      error: false,
      success: true,
      banner: banner,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function getBanners(req, res, next) {
  try {
    const banners = await BannerV1Model.find();

    if (!banners) {
      return res.status(200).json({
        error: true,
        success: false,
        message: "banners not found",
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: banners,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteBanner(req, res, next) {
  try {
    const banner = await BannerV1Model.findById(req.params.id);
    if (!banner) return next(errorHandler("404", "banner not found"));

    const images = banner.image || [];
    for (const imgUrl of images) {
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }

    await BannerV1Model.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Banner Deleted..",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMultipleBanners(req, res, next) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return next(
        errorHandler(400, "Invalid input — expected an array of IDs")
      );
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return next(errorHandler(400, "No valid slide IDs provided"));
    }

    const deleteSlideAndImages = async (slideId) => {
      const slide = await BannerV1Model.findById(slideId);
      if (!slide) return;

      if (Array.isArray(slide.image) && slide.image.length > 0) {
        await Promise.all(
          slide.image.map(async (imgUrl) => {
            try {
              const parts = imgUrl.split("/");
              const publicId = parts[parts.length - 1].split(".")[0];

              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            } catch (err) {
              console.warn(
                "❗Failed to delete image from Cloudinary:",
                imgUrl,
                err.message
              );
            }
          })
        );
      }

      await BannerV1Model.findByIdAndDelete(slideId);
    };

    await Promise.all(validIds.map((id) => deleteSlideAndImages(id)));

    return res.status(200).json({
      success: true,
      error: false,
      message: "Banners deleted successfully ",
    });
  } catch (err) {
    next(errorHandler(500, err.message || err));
  }
}

export async function updateBanner(req, res, next) {
  try {
    const banner = await BannerV1Model.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        category: req.body.category,
        catId: req.body.catId,
        subCatId: req.body.subCatId,
        subCat: req.body.subCat,
        thirdSubCat: req.body.thirdSubCat,
        thirdLevelCatId: req.body.thirdLevelCatId,
        price: req.body.price,
        align: req.body.align,
        image: imagesArr.length > 0 ? imagesArr : req.body.image,
      },
      { new: true }
    );

    if (!banner) {
      return next(errorHandler("500", "Banner cannot be updated..."));
    }

    imagesArr = [];

    return res.status(200).json({
      success: true,
      error: false,
      banner: banner,
      message: "Banner updated successfully ....",
    });
  } catch (err) {
    next(err);
  }
}

export async function getBanner(req, res, next) {
  try {
    const slide = await BannerV1Model.findById(req.params.id);

    if (!slide) {
      return next(errorHandler("404", "no data found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: slide,
    });
  } catch (err) {
    next(err);
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
