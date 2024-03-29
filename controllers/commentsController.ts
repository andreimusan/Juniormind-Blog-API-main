import express from "express";
import Comment from "../models/DTO/comment";
import ICommentsService from "../services/interfaces/ICommentsService";
import ServiceInjector from "../services/serviceInjector";
import { chooseFilter } from "../services/filters/commentsFilter";
import CustomError from "../services/validators/customError";
import User from "../models/DTO/user";

export default class CommentsController {
  commentsService: ICommentsService;

  constructor(
    commentsService: ICommentsService = ServiceInjector.getService(
      "ICommentsService"
    )
  ) {
    this.commentsService = commentsService;
  }

  private static isAdminOrOwnerCheck(user: User, commentAuthor: number) {
    if (!user.isAdmin && user.id !== commentAuthor)
      throw new CustomError(403, "Forbidden access.");
  }

  public get CommentsService() {
    return this.commentsService;
  }

  get = async (req: express.Request, res: express.Response) => {
    let comment;
    try {
      comment = await this.commentsService.get(parseInt(req.params.id, 10));
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res.status(200).json({ data: comment });
  };

  getAll = async (req: express.Request, res: express.Response) => {
    const defaultCommentToSkipIndex = "-1";
    const defaultPaginationLimit = "5";
    if (
      !req.query.filter ||
      !req.query.id ||
      (req.query.filter === "search" &&
        (!req.query.searchText || req.query.searchText.toString().length === 0))
    ) {
      return res.status(400).json({ message: "Invalid query parameters." });
    }

    if (!req.query.previousPageLastCommentIndex)
      req.query.previousPageLastCommentIndex = defaultCommentToSkipIndex;
    if (!req.query.limit) req.query.limit = defaultPaginationLimit;
    if (!req.query.searchText) req.query.searchText = "";

    let filteredComments;
    try {
      filteredComments = await this.commentsService.getAll(
        chooseFilter(req.query.filter.toString()),
        parseInt(req.query.id.toString(), 10),
        parseInt(req.query.previousPageLastCommentIndex.toString(), 10),
        parseInt(req.query.limit.toString(), 10),
        req.query.searchText.toString()
      );
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }
    return res.status(200).json({
      comments: filteredComments?.comments,
      primaryCommentsCount: filteredComments?.primaryCommentsCount,
    });
  };

  add = async (req: express.Request, res: express.Response) => {
    let newComment = new Comment(
      req.body.id,
      req.body.postID,
      req.body.text,
      req.user.id,
      req.body.parentID
    );

    try {
      newComment = await this.commentsService.add(newComment);
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(201)
      .json({ message: "Comment added!", data: newComment });
  };

  update = async (req: express.Request, res: express.Response) => {
    const { text } = req.body;
    if (text === undefined || text == null || text === "")
      return res
        .status(400)
        .json({ message: "Please enter the updated text." });

    let updatedComment;
    try {
      const comment = await this.commentsService.get(
        parseInt(req.params.id, 10)
      );
      CommentsController.isAdminOrOwnerCheck(req.user, comment.author);

      updatedComment = await this.commentsService.update(
        parseInt(req.params.id, 10),
        req.body.text
      );
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ message: "Comment updated!", data: updatedComment });
  };

  remove = async (req: express.Request, res: express.Response) => {
    if (req.params.id === undefined) {
      return res.status(400).json({ message: "Please provide an id." });
    }

    try {
      const comment = await this.commentsService.get(
        parseInt(req.params.id, 10)
      );
      CommentsController.isAdminOrOwnerCheck(req.user, comment.author);

      await this.commentsService.remove(parseInt(req.params.id, 10));
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ message: "The comment and its replies were deleted." });
  };

  removeAll = async (req: express.Request, res: express.Response) => {
    if (req.query.filter === undefined || req.query.id === undefined) {
      return res.status(400).json({ message: "Invalid query parameters." });
    }
    try {
      await this.commentsService.removeAll(
        chooseFilter(req.query.filter.toString()),
        parseInt(req.query.id.toString(), 10),
        req.user
      );
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ message: "The comments and their replies were deleted." });
  };
}
