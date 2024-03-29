import express from "express";
import PostsController from "../controllers/postsController";
import { addUserToRequest } from "../middlewares/addUserToRequest";
import IDBChecker from "../services/interfaces/IDBChecker";
import ServiceInjector from "../services/serviceInjector";

export default class PostsRoutes {
  public router: express.Router;

  private postController: PostsController;

  constructor() {
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(
      ServiceInjector.getService<IDBChecker>("IDBChecker").dbNotConfigured
    );
    this.postController = new PostsController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", this.postController.getAll);
    this.router.get("/:id", this.postController.get);
    this.router.post("/", addUserToRequest, this.postController.add);
    this.router.put("/:id", addUserToRequest, this.postController.update);
    this.router.delete("/:id", addUserToRequest, this.postController.delete);
  }
}
