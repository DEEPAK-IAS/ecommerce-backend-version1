import MyListModel from "../models/myList.model.js";
import errorHandler from "../utils/errorHandler.js";

export async function addToMyList(req, res, next) {
  try {
    const userId = req.userId;
    const {
      productId,
      productTitle,
      rating,
      image,
      price,
      oldPrice,
      brand,
      discount,
    } = req.body;

    const item = await MyListModel.findOne({
      userId: userId,
      productId: productId,
    });

    console.log(item);

    if (item) {
      return next(errorHandler("400", "item already exists in wish list.."));
    }

    const myList = new MyListModel({
      productId,
      productTitle,
      image,
      price,
      oldPrice,
      brand,
      discount,
      userId,
      rating,
    });

    const save = await myList.save();

    return res.status(200).json({
      success: true,
      error: false,
      message: "product successfully added to MyList",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteToMyList(req, res, next) {
  try {
    const myListItem = await MyListModel.findById(req.params.id);

    if (!myListItem) {
      return next(errorHandler("404", "list item not found..."));
    }

    const deletedItem = await MyListModel.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return next(errorHandler("404", "cant delete this item..."));
    }

    return res.status(200).json({
      message: "item deleted successfully...",
      success: true,
      error: false,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyList(req, res, next) {
  try {
    const userId = req.userId;

    const myListItems = await MyListModel.find({ userId: userId });

    return res.status(200).json({
      success: true,
      error: false,
      data: myListItems,
    });
  } catch (err) {
    next(err);
  }
}
