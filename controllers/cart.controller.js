import CartProductModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js";
import errorHandler from "../utils/errorHandler.js";

export async function addToCartItem(req, res, next) {
  try {
    const userId = req.userId;
    console.log(req.body);
    const {
      productTitle,
      image,
      rating,
      price,
      quantity,
      subTotal,
      productId,
      countInStock,
      brand,
      discount,
      oldPrice,
      size,
      ram,
      weight,
    } = req.body;

    if (!productId) {
      return next(errorHandler("402", "provide productId"));
    }

    const cartItem = new CartProductModel({
      userId: userId,
      productTitle,
      image,
      rating,
      price,
      quantity,
      subTotal,
      productId,
      countInStock,
      brand,
      discount,
      oldPrice,
      size,
      ram,
      weight,
    });

    const save = await cartItem.save();

    return res.status(200).json({
      message: "product add to cart successfully...",
      success: true,
      error: false,
      date: save,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCartItem(req, res, next) {
  try {
    const userId = req.userId;

    const cartItem = await CartProductModel.find({ userId: userId });

    return res.status(200).json({
      data: cartItem,
      error: false,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItemQty(req, res, next) {
  try {
    const userId = req.userId;
    const { _id, qty, subTotal, size, ram, weight } = req.body;

    if (!_id || !qty) {
      return next(errorHandler("400", "Provide _id and qty"));
    }

    const updateData = {
      quantity: qty,
      subTotal: subTotal,
    };

    if (size) updateData.size = size;
    if (ram) updateData.ram = ram;
    if (weight) updateData.weight = weight;

    const updateCartItem = await CartProductModel.updateOne(
      { _id: _id, userId: userId },
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "Cart item updated successfully",
      success: true,
      error: false,
      data: updateCartItem,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCartItemQty(req, res, next) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!id) {
      return next(errorHandler("400", "provide id"));
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id: id,
      userId: userId,
    });

    if (!deleteCartItem) {
      return next(errorHandler("400", "cannot delete item"));
    }

    return res.status(200).json({
      message: "Item remove",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (err) {
    next(err);
  }
}

export async function emptyCartController(req, res, next) {
  try {
    const userId = req.params.id;

    await CartProductModel.deleteMany({ userId: userId });

    console.log("welcome");

    return res.status(200).json({
      error: false,
      success: true,
      message: "cart cleared....",
    });
  } catch (err) {
    next(err);
  }
}
