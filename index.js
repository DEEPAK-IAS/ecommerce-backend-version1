import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import MyListRouter from "./route/mylist.route.js";
import AddressRouter from "./route/address.route.js";
import HomeSliderRouter from "./route/homeSlider.route.js";
import bannerV1Router from "./route/bannerV1.route.js";
import BlogRouter from "./route/blog.route.js";
import OrderRouter from "./route/order.route.js";

const app = express();

app.use(cors());
// app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "server is running" + process.env.PORT,
  });
});

app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/myList", MyListRouter);
app.use("/api/address", AddressRouter);
app.use("/api/homeSlider", HomeSliderRouter);
app.use("/api/bannerV1", bannerV1Router);
app.use("/api/blog", BlogRouter);
app.use("/api/order", OrderRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: message,
    error: true,
  });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("server is running ", process.env.PORT);
  });
});
