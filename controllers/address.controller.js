import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import errorHandler from "../utils/errorHandler.js";

export const addAddress = async (req, res, next) => {
  try {
    const {
      address_line,
      city,
      state,
      pincode,
      country,
      mobile,
      selected,
      landMark,
      addressType,
    } = req.body;

    const userId = req.userId;

    if (
      !address_line ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !mobile ||
      selected === undefined
    ) {
      return next(errorHandler("500", "please provide all the fields"));
    }

    const address = new AddressModel({
      address_line,
      city,
      state,
      pincode,
      country,
      mobile,
      userId,
      selected,
      landMark,
      addressType,
    });

    const saveAddress = await address.save();
    console.log(saveAddress);

    const updateCartUser = await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          address_details: saveAddress._id,
        },
      }
    );

    return res.status(200).json({
      message: "address stored successfully...",
      error: false,
      success: true,
      data: saveAddress,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAddress = async (req, res, next) => {
  try {
    const address = await AddressModel.find({
      userId: req.userId,
    }).select("-password -refresh_token");
    if (!address) {
      return next(errorHandler("404", "address not found"));
    }

    return res.status(200).json({
      message: "all message arrived",
      error: false,
      success: true,
      data: address,
    });
  } catch (err) {
    next(err);
  }
};

export const selectAddress = async (req, res, next) => {
  try {
    const userId = req.userId;

    const address = await AddressModel.find({
      _id: req.params.id,
      userId: userId,
    });

    const updateAllAddress = await AddressModel.updateMany(
      {
        userId: userId,
      },
      {
        selected: false,
      },
      { new: true }
    );

    if (!address) {
      return next(errorHandler("404", "address not found..."));
    } else {
      const updateAddress = await AddressModel.findByIdAndUpdate(
        req.params.id,
        {
          selected: req.body.selected,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "address changed",
        error: false,
        success: true,
        address: updateAddress,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.userId;
    const _id = req.params.id;

    if (!_id) {
      return next(errorHandler("404", "provide _id"));
    }

    const deletedAddress = await AddressModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (!deletedAddress) {
      return next(errorHandler("404", "address not found"));
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          address_details: _id,
        },
      }
    );

    return res.status(200).json({
      message: "address deleted successfully...",
      error: false,
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleAddress = async (req, res, next) => {
  try {
    const id = req.params.id;
    const address = await AddressModel.findOne({ _id: id });

    if (!address) {
      return next(errorHandler("404", "address not found..."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      address: address,
    });
  } catch (err) {
    next(err);
  }
};

export async function updateAddress(req, res, next) {
  try {
    const id = req.params.id;

    const {
      address_line,
      city,
      state,
      pincode,
      country,
      mobile,
      userId,
      selected,
      landMark,
      addressType,
    } = req.body;

    const updatedAddress = await AddressModel.updateOne(
      { _id: id, userId: userId },
      {
        address_line,
        city,
        state,
        pincode,
        country,
        mobile,
        userId,
        selected,
        landMark,
        addressType,
      },
      { new: true }
    );

    if (!updatedAddress) {
      return next(errorHandler("404", "address not found"));
    }

    return res.json({
      message: "Address updated successfully..",
      error: false,
      success: true,
      address: updatedAddress,
    });
  } catch (err) {
    next(errorHandler("500", err.message || err));
  }
}
