import { Router } from "express";
const AddressRouter = Router();
import auth from "../middlewares/auth.js";
import {
  addAddress,
  deleteAddress,
  getAllAddress,
  getSingleAddress,
  selectAddress,
  updateAddress,
} from "../controllers/address.controller.js";

AddressRouter.post("/add", auth, addAddress)
  .get("/get-all-address", auth, getAllAddress)
  .get("/:id", auth, getSingleAddress)
  .put("/select-address/:id", auth, selectAddress)
  .delete("/:id", auth, deleteAddress)
  .put("/:id", auth, updateAddress);

export default AddressRouter;
