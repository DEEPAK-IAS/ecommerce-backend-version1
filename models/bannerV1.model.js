import mongoose from "mongoose";

const bannerV1Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
      required: true,
    },
    catId: {
      type: String,
      default: "",
    },
    subCatId: {
      type: String,
      default: "",
    },
    subCat: {
      type: String,
      default: "",
    },
    thirdSubCat: {
      type: String,
      default: "",
    },
    thirdLevelCatId: {
      type: String,
      default: "",
    },
    align: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: [String],
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const BannerV1Model = mongoose.model("bannerV1", bannerV1Schema);

export default BannerV1Model;
