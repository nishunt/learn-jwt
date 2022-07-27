import JWT from "jsonwebtoken";
import createHttpError from "http-errors";
import redis from "./ioredis.js";

const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    // define payload, secret and options to use in the sign function
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      // according to the jwt doc,
      // subject: userId,
      // issuer: expressServer,
      // audience: www.whatever.com,
      // Additional information should be put in payload, eg. roles for role based auth
      expiresIn: "1h",
      subject: userId,
      issuer: "expressServer",
      audience: "www.nishant.surge.sh",
    };
    JWT.sign(payload, secret, options, (error, token) => {
      if (error) {
        console.log(error.message);
        reject(createHttpError.InternalServerError());
      }
      resolve(token);
    });
  });
};

const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    // define payload, secret and options to use in the sign function
    const payload = {};
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      // according to the jwt doc,
      // subject: userId,
      // issuer: expressServer,
      // audience: www.whatever.com,
      // Additional information should be put in payload, eg. roles for role based auth
      expiresIn: "1y",
      subject: userId,
      issuer: "expressServer",
      audience: "www.nishant.surge.sh",
    };
    JWT.sign(payload, secret, options, (error, token) => {
      if (error) {
        console.log(error.message);
        reject(createHttpError.InternalServerError());
      }
      // save the userId=>token pair into the redisDB and then resolve the promise sending back the generated token
      // @me ❗️❗️❗️remember to change the time accordingly when reusing this code❗️❗️❗️
      redis.set(userId, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          console.log(err.message);
          reject(createHttpError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  });
};

// we don't promise here because this function will only be used as a middleware
const verifyAccessToken = (req, res, next) => {
  if (!req.headers.authorization) return next(createHttpError.Unauthorized());
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  const secret = process.env.ACCESS_TOKEN_SECRET;
  JWT.verify(token, secret, (err, payload) => {
    if (err) {
      // as because "JsonWebTokenError" errors have sensitive information that might be used by an intruder to break into the server, we hide such error messages from the client as shown below

      const errorMessage =
        err.name == "JsonWebToken" ? "Unauthorized" : err.message;
      return next(createHttpError.Unauthorized(errorMessage));
    }

    req.payload = payload;
    next();
  });
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createHttpError.Unauthorized());
        const userId = payload.sub;
        // if the client has sent a token that has already been expired previously, we use the data of previous refreshTokens we have stored in the redisDB to ensure we blacklist that request.
        redis.get(userId, (err, result) => {
          if (err) {
            console.log(err.message);
            reject(createHttpError.InternalServerError());
            return;
          }
          if (refreshToken == result) return resolve(userId);
          reject(createHttpError.Unauthorized());
        });
      }
    );
  });
};
export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
