const asyncHandler = require("../middleware/async");
const createError = require("../utilis/createError");
const Order = require("../models/Order");
const mongoose = require("mongoose");

//Self done
const Product = require("../models/Product");


const connectDB = require("../config/db");

const getOrders = asyncHandler(async (req, res, next) => {
  console.log("getOrders in controller/order.js");
  res.status(200).send(res.advanceResults);
});

const authOrder = asyncHandler(async (req, res, next) => {
  console.log("in authOrder in order.js in controller.js");
  const authOrders = await Order.find({ userId: req.user._id });
  console.log("authorder in controlleer/order.js");
  return res.status(200).send({
    status: "success",
    count: authOrders.length,
    data: authOrders,
  });
});

const getOrder = asyncHandler(async (req, res, next) => {
  console.log("in getOrder in order.js in corntroller.js");
  const findOrder = await Order.findById(req.params.orderId).populate({
    path: "userId",
    select: "name email",
  });

  if (!findOrder)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  res.status(200).send({
    status: "success",
    data: findOrder,
  });
});

const createOrder = asyncHandler(async (req, res, next) => {
  console.log("createorder in controller/order.js and req.user._id " + req.user._id);
  const newOrder = await Order.create({
    ...req.body,
    userId: req.user._id,
  });
  // const getOrderItem = await Order.findById(req.params.orderId);
  // console.log(getOrderItem);
  // console.log("inside createOrder in order.js in controller after newOrder");
  // console.log("newOrder " + newOrder);
  let orderItems = newOrder.orderItems;

  // console.log(orderItems);
  // const updatedorder = await Order.findById(req.params.orderId);
  // console.log("updateorder " + updateorder);
  //let orderItems = updatedorder.orderItems
  //console.log("orderItems" + orderItems);
  //console.log("fsdf line 81 order.js");
  orderItems.forEach(async (i)=>{
    // console.log("this is i " +  i);
    let productId = i.productId;
      
    // console.log("this is productId " + productId);
    let qty = i.qty;
    let product = await Product.findById(productId);
    //console.log("product is " + product + typeof(product));
    // console.log("product description " + product.description);
    // product.countInStock -= qty;
    // await product.save();
    // var myquery = { _id: `${productId}` };
    // var newvalues = { $set: {countInStock: product.countInStock} };
    //  const db1=connectDB();
    //  console.log(db1);
    // let collection = db1.myFirstDatabase.products;
    // console.log("this is my collection " + collection);
    // collection.update(myquery, newvalues, ()=>{});
    // console.log("inside controller/order.js after product.save\n");
    // product.get({countInStock});

    //console.log("product in count stock " + product.countInStock);
    // console.log("before product update");
    let finalqty = product.countInStock-qty;
    await Product.updateOne( {_id: productId}, 
      {countInStock:finalqty}
    );
    // console.log("after product update ");
  });
  
  res
    .status(200)
    .send({ status: "success", message: "New Order Created", data: newOrder });
    console.log("createorder in controller/order.js after res.send()");
});

/*const createOrder = asyncHandler(async (req, res, next) => {
  const newOrder = await Order.create({
    ...req.body,
    userId: req.user._id,
  });

  res
    .status(201)
    .send({ status: "success", message: "New Order Created", data: newOrder });
});*/



const payment = asyncHandler(async (req, res, next) => {
  console.log("in payment function in order.js in controller");
  const order = await Order.findById(req.params.orderId);
  console.log("in payment function in order.js in controller");
  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );
  order.isPaid = true;
  order.paidAt = Date.now();
  if (req.body.status) {
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
  } else {
    //Esewa payment integration
    order.paymentResult = {
      id: order._id,
      status: 200,
      update_time: Date.now(),
      email_address: "epaytest@gmail.com",
    };
  }

  await order.save();

  const updatedorder = await Order.findById(req.params.orderId);
  
  // let orderItems = updatedorder.orderItems
  // console.log("orderItems" + orderItems);
  // //console.log("fsdf line 81 order.js");
  // orderItems.forEach((i)=>{
  //   let productId = i.productId;
  //   let qty = i.qty;

  //   let product = Product.findById(productId);
  //   product.countInStock -= qty;
  //   product.save();
  //   console.log("inside controller/order.js after product.save\n");
  // });
      
  res
    .status(201)
    .send({ status: "success", message: "Order Paid.", data: updatedorder });
});

const deliverOrder = asyncHandler(async (req, res, next) => {
  console.log("deliverOrder function in controller/order.js");
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  await order.save();

  const updatedorder = await Order.findById(req.params.orderId);

  res
    .status(201)
    .send({ status: "success", message: "Order Paid.", data: updatedorder });
});

const updateOrder = asyncHandler(async (req, res, next) => {
  console.log("updateOrder function in controller/order.js");
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  //check if order belongs to user created or user is admin

  const findOrder = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user._id,
  });

  if (!findOrder && req.user.role !== "admin")
    throw createError(400, "Not authorized to update this review");

  await Order.findByIdAndUpdate(req.params.orderId, req.body, {
    new: true,
    runValidators: true,
  });

  const updatedOrder = await Order.findById(req.params.orderId);

  res.status(200).send({ status: "success", data: updatedOrder });
});

const deleteOrder = asyncHandler(async (req, res, next) => {
  console.log("updateOrder function in controller/deleteOrder.js");
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  //check if review belongs to user created or user is admin
  const findOrder = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user._id,
  });

  if (!findOrder && req.user.role !== "admin")
    throw createError(400, "Not authorized to update this review");

  await Order.findByIdAndDelete(req.params.orderId);

  res
    .status(204)
    .send({ status: "success", message: "Order Deleted Successfully" });
});
module.exports = {
  getOrders,
  authOrder,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  payment,
  deliverOrder,
};
