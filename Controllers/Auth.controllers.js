import createHttpError from "http-errors";
import User from "../Models/User.model.js";
import { authSchema } from "../helpers/joi.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../helpers/jwt.js";
import redis from "../helpers/ioredis.js";

const register = async (req, res, next) => {
  try {
    // //doing the validation conventionally:

    // res.send(req.body);
    // const { email, password } = req.body;
    // if (!email || !password)
    //   throw createHttpError.BadRequest("email/password missing");

    // doing the validation using the joe validation schema:
    const result = await authSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createHttpError.Conflict(
        `Email: ${result.email} is already taken!`
      );
    const user = new User(result);
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    // if the error is a joi error, change the status of the error status to 422 from the default 500 error
    // because joi errors originate when client doesn't send data according to the joi schema
    if (error.isJoi) error.status = 422;
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (!doesExist) throw createHttpError.NotFound("User not registered yet!");
    const correctPassword = await doesExist.isValidPassword(result.password);
    if (!correctPassword)
      throw createHttpError.Unauthorized("username/password incorrect");
    // id/userId is the id with which the username,password are stored in mongoDB
    const accessToken = await signAccessToken(doesExist.id);
    const refreshToken = await signRefreshToken(doesExist.id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi)
      return next(createHttpError.BadRequest("Invalid Id/password"));
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createHttpError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const newAccessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  // take out the refresh token the client sends in the body,
  // extract userId from it,
  // delete that userId=>refreshToken pair from the local redisDB
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createHttpError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    redis.del(userId, (err, val) => {
      if (err) {
        console.log(err);
        throw createHttpError.InternalServerError();
      }
      console.log(val);
      // 204 is for "everything went ok and there's nothing to send to the client"
      res.sendStatus(204);
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, refresh, logout };
