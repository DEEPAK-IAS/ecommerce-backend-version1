import errorHandler from "../utils/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import homeSliderModel from "../models/homeSlider.model.js";
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

export async function createHomeSlider(req, res, next) {
  try {
    let homeSlider = new homeSliderModel({
      image: imagesArr.length !== 0 ? imagesArr : req.body.image,
    });

    if (!homeSlider) {
      return next(errorHandler("500", "category not created"));
    }

    await homeSlider.save();

    imagesArr = [];

    return res.status(200).json({
      message: "category created successfully..",
      success: true,
      error: false,
      data: homeSlider,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllHomeSlides(req, res, next) {
  try {
    const slides = await homeSliderModel.find();

    if (!slides) {
      return next(errorHandler("404", "no data found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: slides,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllHomeSlide(req, res, next) {
  try {
    const slide = await homeSliderModel.findById(req.params.id);

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

export async function deleteSlide(req, res, next) {
  try {
    let deleteHomeSlide = await homeSliderModel.findById(req.params.id)

    const images = deleteHomeSlide?.image || [];
    for (const imgUrl of images) {
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }


    deleteHomeSlide = await homeSliderModel.findByIdAndDelete(
      req.params.id
    );

    if (!deleteHomeSlide) {
      return next(errorHandler("404", "file not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: "Slide deleted successfully...",
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSlide(req, res, next) {
  try {
    const slideId = req.params.id;
    const updateData = req.body;

    const updatedSlide = await homeSliderModel.findByIdAndUpdate(
      slideId,
      updateData,
      { new: true }
    );

    if (!updatedSlide) {
      return next(errorHandler("404", "Slide not found for update."));
    }

    return res.status(200).json({
      message: "Slide updated successfully.",
      success: true,
      error: false,
      data: updatedSlide,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMultipleSlides(req, res, next) {
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
      const slide = await homeSliderModel.findById(slideId);
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

      await homeSliderModel.findByIdAndDelete(slideId);
    };

    await Promise.all(validIds.map((id) => deleteSlideAndImages(id)));

    return res.status(200).json({
      success: true,
      error: false,
      message: "Slides deleted successfully ",
    });
  } catch (err) {
    next(errorHandler(500, err.message || err));
  }
}
