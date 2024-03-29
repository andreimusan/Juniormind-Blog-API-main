/* eslint-disable prettier/prettier */
import express from "express";
import UsersController from "../controllers/usersController";
import IDBChecker from "../services/interfaces/IDBChecker";
import ServiceInjector from "../services/serviceInjector";
import { authAdmin } from "../middlewares/basicAuthorization";
import { addUserToRequest } from "../middlewares/addUserToRequest";

export default class UsersRoutes {
  public router: express.Router;

  private usersController: UsersController;

  constructor() {
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(
      ServiceInjector.getService<IDBChecker>("IDBChecker").dbNotConfigured
    );
    this.usersController = new UsersController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/",
      addUserToRequest,
      authAdmin,
      this.usersController.getAll
    );
    this.router.get(
      "/:id",
      addUserToRequest,
      this.usersController.get
    );
    this.router.post(
      "/",
      addUserToRequest,
      authAdmin,
      this.usersController.post
    );
    this.router.delete(
      "/:id",
      addUserToRequest,
      this.usersController.delete
    );
    this.router.put(
      "/:id",
      addUserToRequest,
      this.usersController.update
    );
  }
}
