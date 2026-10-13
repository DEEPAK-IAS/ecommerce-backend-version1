import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },

    rating: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "",
    },
    review: {
      type: String,
      default: "",
    },
    productId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("reviews", reviewSchema);

export default ReviewModel;
