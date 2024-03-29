import express from "express";
import CommentsController from "../controllers/commentsController";
import IDBChecker from "../services/interfaces/IDBChecker";
import ServiceInjector from "../services/serviceInjector";
import { addUserToRequest } from "../middlewares/addUserToRequest";

export default class CommentRoutes {
  public router: express.Router;

  private commentController: CommentsController;

  constructor() {
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(
      ServiceInjector.getService<IDBChecker>("IDBChecker").dbNotConfigured
    );
    this.commentController = new CommentsController();
    this.initialiseRoutes();
  }

  initialiseRoutes() {
    this.router.get("/:id", this.commentController.get);
    this.router.get("/", this.commentController.getAll);
    this.router.post("/", addUserToRequest, this.commentController.add);
    this.router.put("/:id", addUserToRequest, this.commentController.update);
    this.router.delete("/:id", addUserToRequest, this.commentController.remove);
    this.router.delete("/", addUserToRequest, this.commentController.removeAll);
  }
}
