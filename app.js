import express from "express";
// Using morgan to get request details in the console
import morgan from "morgan";
import createHttpError from "http-errors";
import "dotenv/config";
import "./helpers/mongodb.js";
import { verifyAccessToken } from "./helpers/jwt.js";
import AuthRoute from "./Routes/Auth.route.js";
import "./helpers/ioredis.js";
// client.set("foo", "nishant");

// // Tried using get() this way but didn't work out
// await client.get("foo", (value) => {
//   if (err) console.log(err.message);
//   console.log(value);
// });

// This worked though
// console.log(await client.get("foo"));

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", verifyAccessToken, async (req, res, next) => {
  res.send("Hello from this side");
});

app.use("/auth", AuthRoute);

// catch all route
app.use(async (req, res, next) => {
  // conventional way without http-errors package:
  //   const error = new Error("not found");
  //   error.status = 404;
  //   next(error);

  //   with http-errors package
  next(createHttpError.NotFound());
});

// when you declare a middleware with err as first param in the callback, it automatically becomes an error handling middleware used to pass on all the errors to the client using 'next(error)'
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
