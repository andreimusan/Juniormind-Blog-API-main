import express from "express";
import DBController from "../controllers/DBController";
import IDBChecker from "../services/interfaces/IDBChecker";
import ServiceInjector from "../services/serviceInjector";

export default class DBRoutes {
  public router: express.Router;

  private databaseController: DBController;

  constructor() {
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(
      ServiceInjector.getService<IDBChecker>("IDBChecker").dbAlreadyConfigured
    );
    this.databaseController = new DBController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/", this.databaseController.saveDBConfig);
  }
}
