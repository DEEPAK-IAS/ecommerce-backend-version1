import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import errorHandler from "../utils/errorHandler.js";
import UserModel from "../models/user.model.js";

export async function createOrder(req, res, next) {
  try {
    let order = new OrderModel({
      userId: req.body.userId,
      products: req.body.products,
      paymentId: req.body.paymentId,
      payment_status: req.body.payment_status,
      delivery_address: req.body.delivery_address,
      totalAmt: req.body.totalAmt,
      date: req.body.date,
    });

    if (!order) {
      return next(errorHandler("500", "order failed..."));
    }

    for (let i = 0; i < req.body.products.length; i++) {
      await ProductModel.findByIdAndUpdate(
        req.body.products[i].productId,
        {
          countInStock:
            parseInt(req.body.products[i].countInStock) -
            req.body.products[i].quantity,
        },
        { new: true }
      );
    }

    order = await order.save();

    return res.status(200).json({
      error: false,
      success: true,
      message: "Order Placed..",
      order: order,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderDetails(req, res, next) {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : null; // if no limit, fetch all

    // Get total count of orders for this user
    const total = await OrderModel.countDocuments({ userId });

    let orderListQuery = OrderModel.find({ userId })
      .populate("delivery_address userId")
      .sort({ createdAt: -1 });

    if (limit) {
      const totalPages = Math.ceil(total / limit);

      if (page > totalPages && total > 0) {
        return res.status(404).json({
          message: "Page not found",
          success: false,
          error: true,
        });
      }

      orderListQuery = orderListQuery.skip((page - 1) * limit).limit(limit);
    }

    const orderList = await orderListQuery;

    return res.status(200).json({
      message: "Order list fetched successfully",
      data: orderList,
      error: false,
      success: true,
      total,
      page: limit ? page : 1,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      limit: limit || total,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const orderId = req.params.id;
    const { order_status } = req.body;
    const userId = req.userId;
    const updatedItem = await OrderModel.updateOne(
      {
        _id: orderId,
        userId: userId,
      },
      {
        order_status: order_status,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "order status updated",
      error: false,
      success: true,
      order: updatedItem,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTotalOrdersCount(req, res, next) {
  try {
    const ordersCount = await OrderModel.countDocuments();
    return res.status(200).json({
      error: false,
      success: true,
      count: ordersCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function totalSales(req, res, next) {
  try {
    const currentYear = new Date().getFullYear();
    const orderList = await OrderModel.find();

    let totalSales = 0;
    const monthlySales = [
      { name: "JAN", TotalSales: 0 },
      { name: "FEB", TotalSales: 0 },
      { name: "MARCH", TotalSales: 0 },
      { name: "APRIL", TotalSales: 0 },
      { name: "MAY", TotalSales: 0 },
      { name: "JUNE", TotalSales: 0 },
      { name: "JULY", TotalSales: 0 },
      { name: "AUG", TotalSales: 0 },
      { name: "SEP", TotalSales: 0 },
      { name: "OCT", TotalSales: 0 },
      { name: "NOV", TotalSales: 0 },
      { name: "DEC", TotalSales: 0 },
    ];

    for (const order of orderList) {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-based index

      if (year === currentYear) {
        totalSales += parseInt(order.totalAmt);
        monthlySales[month].TotalSales += parseInt(order.totalAmt);
      }
    }

    return res.status(200).json({
      success: true,
      error: false,
      totalSales,
      monthlySales,
    });
  } catch (err) {
    next(err);
  }
}

export async function totalUsers(req, res, next) {
  try {
    const currentYear = new Date().getFullYear();

    const users = await UserModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = [
      "JAN",
      "FEB",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    let monthlyUsers = months.map((name) => ({
      name,
      TotalUsers: 0,
    }));

    users.forEach((u) => {
      const monthIndex = u._id.month - 1;
      monthlyUsers[monthIndex].TotalUsers = u.count;
    });

    res.status(200).json({
      success: true,
      currentYear,
      monthlyUsers,
    });
  } catch (err) {
    next(err);
  }
}
