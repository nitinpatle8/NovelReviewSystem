const asyncHandler = require("../middleware/async");
const createError = require("../utilis/createError");
const path = require("path");
const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getProducts = asyncHandler(async (req, res, next) => {

  const keyWord = req.query.keyWord;

  console.log(keyWord); // printing undefined
  console.log(req.query.name);
  console.log(req.query);
  console.log("in controller/product.js in getProducts function debug 0");

  if (keyWord) {
    const searchItem = keyWord
      ? { name: { $regex: keyWord, $options: "i" } }
      : {};

    const searchProduct = await Product.find(searchItem);
    console.log("in controller/product.js in getProducts function debug 1");
    res.status(200).send({
      status: "success",

      data: { results: searchProduct, count: searchProduct.length },
    });

    console.log("in controller/product.js in getProducts function debug 2");

  } else {
    console.log("in controller/product.js in getProducts function debug 3");
    res.status(200).send({ status: "success", data: res.advanceResults });
  }
});

const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId).populate({
    path: "Reviews",
    select: "title text",
  });
  console.log("in controller/product.js in getProduct function debug 0");
  if (!product)
    throw createError(
      404,
      `Product is not found with id of ${req.params.productId}`
    );

    console.log("in controller/product.js in getProduct function debug 1");

  res.status(200).send({ status: "success", data: product });
});

const createProduct = asyncHandler(async (req, res, next) => {
  if (!req.files) throw createError(400, "Please add a photo");

  console.log(req.files);

  const file = req.files.productImage;

  //Check file type
  if (!file.mimetype.startsWith("image"))
    throw createError(400, "This file is not supported");

  //Check file size
  if (file.size > process.env.FILE_UPLOAD_SIZE)
    throw createError(
      400,
      `Please upload a image of size less than ${process.env.FILE_UPLOAD_SIZE}`
    );

    console.log("in controller/product.js in createProduct function debug 0");
  cloudinary.uploader.upload(
    file.tempFilePath,
    { use_filename: true, folder: "products" },
    async function (error, result) {
      if (error) throw createError(409, `failed to create product`);
      const product = await Product.create({
        ...req.body,
        productImage: result.url,
      });
      res.status(200).send({ status: "success", data: product });
    }
  );
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const editProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  console.log("in controller/product.js in UpdateProduct function debug 0");
  if (!editProduct)
    throw createError(
      404,
      `Product is not found with id of ${req.params.productId}`
    );

  const updatedProduct = await Product.findById(req.params.productId);

  res.status(201).send({ status: "success", data: updatedProduct });
});
const deleteProduct = asyncHandler(async (req, res, next) => {
  const deleteProduct = await Product.findById(req.params.productId);

  if (!deleteProduct)
    throw createError(
      404,
      `User is not found with id of ${req.params.productId}`
    );

  await deleteProduct.remove();

  res
    .status(204)
    .send({ status: "success", message: "Product Deleted Successfully" });
});
module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
