const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { unknownEndpoints, errorHandler } = require("./middleware/error");
const connectDb = require("./config/db");
const app = express();

dotenv.config({ path: ".env" });

const db = connectDb();

//rouets
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const reviewRouter = require("./routes/review");
const orderRouter = require("./routes/order");
const categoryRouter = require("./routes/category");

app.use(express.json());

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// jayesh
var bodyParser = require('body-parser');
const cloudinary = require("cloudinary").v2;

app.use(bodyParser.json());

cloudinary.config({

  cloud_name: 'dncbi0nnk',
  api_key: '875596772675126',
  api_secret: 'tRQOnKM9OKi5mV0IyLrZPZX3BVU'

});

app.use(cors());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/category", categoryRouter);

app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(unknownEndpoints);
app.use(errorHandler);

// jayesh
// app.post('/', (req, res, next) => {
//   const file = req.files.photo;
//   console.log(req.body);
//   res.send("this is post method");
// })

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandle promise rejection

process.on("unhandledRejection", (err, promise) => {
  // debug
  console.log('before error message ');
  console.log(promise);
  console.log(`Error: ${err.message}`.red.bold);
  //close the server
  server.close(() => process.exit(1));
});

