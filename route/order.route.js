import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createOrder,
  getOrderDetails,
  getTotalOrdersCount,
  totalSales,
  totalUsers,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const OrderRouter = Router();

OrderRouter.post("/create", auth, createOrder)
  .get("/", auth, getOrderDetails)
  .put("/:id", auth, updateOrderStatus)
  .get("/count", auth, getTotalOrdersCount)
  .get("/totalSales", totalSales)
  .get("/totalUsers", totalUsers);

export default OrderRouter;
