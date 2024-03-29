/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/DTO/user";
import IToken from "../services/oauth/IToken";
import IUsersService from "../services/interfaces/IUsersService";
import ServiceInjector from "../services/serviceInjector";
import CustomError from "../services/validators/customError";

require("dotenv").config();

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const addUserToRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.headers.authorization !== undefined) {
    try {
      if (!process.env.JWT_KEY) throw new Error("No key found.");
      const jwtSecret = process.env.JWT_KEY;
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret) as IToken;
      const usersService: IUsersService =
        ServiceInjector.getService("IUsersService");
      const isActive = (await usersService.get(decoded.userId)).active;
      if (isActive) {
        req.user = new User(
          decoded.userId,
          decoded.username,
          "",
          "",
          decoded.isAdmin
        );
        return next();
      }
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json({ message: error.message });

      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  return res.status(401).json({ message: "Unauthorized" });
};
