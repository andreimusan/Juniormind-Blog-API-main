/* eslint-disable class-methods-use-this */
import express from "express";

export default class CorsMiddleware {
  corsOptions = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, content-type, Accept, Authorization, Origin"
    );
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  };
}
