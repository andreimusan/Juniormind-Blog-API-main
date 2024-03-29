import express from "express";
import OAuthController from "../services/oauth/oauthController";

export default class OAuthRoutes {
  public router: express.Router;

  private oauthController: OAuthController;

  constructor() {
    this.router = express.Router();
    this.router.use(express.json());
    this.oauthController = new OAuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/", this.oauthController.login);
  }
}
