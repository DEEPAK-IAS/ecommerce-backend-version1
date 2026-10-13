import errorHandler from "../utils/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";
import BlogModel from "../models/blog.model.js";

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

export async function createBlog(req, res, next) {
  try {
    let blog = new BlogModel({
      title: req.body.title,
      images: imagesArr.length > 0 ? imagesArr : req.body.image,
      description: req.body.description,
    });

    await blog.save();
    if (!blog) {
      return next(errorHandler("500", "banner not created"));
    }

    imagesArr = [];

    return res.status(200).json({
      message: "blog created successfully...",
      error: false,
      success: true,
      blog: blog,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}

export async function getAllBlogs(req, res, next) {
  try {
    const blogs = await BlogModel.find();

    if (!blogs) {
      return next(errorHandler("404", "no data found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: blogs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBlog(req, res, next) {
  try {
    const blog = await BlogModel.findById(req.params.id);

    if (!blog) {
      return next(errorHandler("404", "no data found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: blog,
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

export async function deleteBlog(req, res, next) {
  try {
    let blog = await BlogModel.findById(req.params.id);

    const images = blog?.images || [];
    for (const imgUrl of images) {
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }

    blog = await BlogModel.findByIdAndDelete(req.params.id);

    if (!blog) {
      return next(errorHandler("404", "file not found"));
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: "blog deleted successfully...",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMultipleBlogs(req, res, next) {
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
      const slide = await BlogModel.findById(slideId);
      if (!slide) return;

      if (Array.isArray(slide.images) && slide.images.length > 0) {
        await Promise.all(
          slide.images.map(async (imgUrl) => {
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

      await BlogModel.findByIdAndDelete(slideId);
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

export async function updateBlog(req, res, next) {
  try {
    const slideId = req.params.id;
    const updateData = req.body;

    const updatedSlide = await BlogModel.findByIdAndUpdate(
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
