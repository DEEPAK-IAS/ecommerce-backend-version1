import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    weight: {
      type: String,
    },
    ram: {
      type: String,
    },
  },
  { timestamps: true }
);

const CartProductModel = mongoose.model("cart", cartSchema);

export default CartProductModel;
