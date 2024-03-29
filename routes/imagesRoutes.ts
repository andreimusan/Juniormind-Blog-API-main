import express from "express";
import ImagesController from "../controllers/imagesController";
import { addUserToRequest } from "../middlewares/addUserToRequest";
import IDBChecker from "../services/interfaces/IDBChecker";
import ServiceInjector from "../services/serviceInjector";

export default class ImagesRoutes {
  public router: express.Router;

  private imagesController: ImagesController;

  constructor() {
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(
      ServiceInjector.getService<IDBChecker>("IDBChecker").dbNotConfigured
    );
    this.imagesController = new ImagesController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/", addUserToRequest, this.imagesController.add);
    this.router.delete(
      "/:imageName",
      addUserToRequest,
      this.imagesController.delete
    );
  }
}
