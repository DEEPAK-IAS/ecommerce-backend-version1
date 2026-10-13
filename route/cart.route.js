import { Router } from "express";
import {
  addToCartItem,
  deleteCartItemQty,
  emptyCartController,
  getCartItem,
  updateCartItemQty,
} from "../controllers/cart.controller.js";
import auth from "../middlewares/auth.js";

const cartRouter = Router();

cartRouter
  .post("/create", auth, addToCartItem)
  .get("/get", auth, getCartItem)
  .put("/update-qty", auth, updateCartItemQty)
  .delete("/delete-cart-item/:id", auth, deleteCartItemQty)
  .delete("/emptyCart/:id", auth, emptyCartController);

export default cartRouter;
