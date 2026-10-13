import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    catName: {
      type: String,
      default: "",
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
    subCatName: {
      type: String,
      default: "",
    },
    thirdSubCat: {
      type: String,
      default: "",
    },
    thirdSubCatName: {
      type: String,
      default: "",
    },
    thirdLevelCatId: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      required: true,
    },
    sale: {
      type: Number,
      default: 0,
    },
    productRams: [{ type: String, default: null }],
    size: [
      {
        type: String,
        default: null,
      },
    ],
    productWeight: [
      {
        type: String,
        default: "",
      },
    ],
    location: [
      {
        type: String,
        default: null,
      },
    ],
    bannerImages: [
      {
        type: String,
        default: null,
      },
    ],
    bannerTitleName: {
      type: String,
      default: "",
    },
    isDisplayOnHomeBanner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("products", ProductSchema);

export default ProductModel;
