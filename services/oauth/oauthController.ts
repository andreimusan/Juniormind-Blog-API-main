/* eslint-disable class-methods-use-this */
import express from "express";
import IOAuthService from "./IOAuthService";
import ServiceInjector from "../serviceInjector";

export default class OAuthController {
  private oauthService: IOAuthService;

  constructor(
    oauthService: IOAuthService = ServiceInjector.getService<IOAuthService>(
      "IOAuthService"
    )
  ) {
    this.oauthService = oauthService;
  }

  login = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const oauth = this.oauthService.getOAuthServer();
    await oauth.token()(req, res, next);
  };
}
