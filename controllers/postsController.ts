/* eslint-disable class-methods-use-this */
import { request, response } from "express";
import IPostsService from "../services/interfaces/IPostsService";
import ServiceInjector from "../services/serviceInjector";
import Post from "../models/DTO/post";
import PostsFilterType from "../services/filters/postsFilterType";
import IPostValidatorService from "../services/interfaces/IPostValidatorService";
import CustomError from "../services/validators/customError";
import User from "../models/DTO/user";

export default class PostsController {
  private postsService: IPostsService;

  private validatorService: IPostValidatorService;

  constructor(
    service: IPostsService = ServiceInjector.getService<IPostsService>(
      "IPostsService"
    ),
    validatorService: IPostValidatorService = ServiceInjector.getService<IPostValidatorService>(
      "IPostValidatorService"
    )
  ) {
    this.postsService = service;
    this.validatorService = validatorService;
  }

  private isUserAuthorised(user: User, owner: number) {
    if (user.isAdmin || user.id === owner) return;
    throw new CustomError(403, "Forbidden access.");
  }

  // get post by id
  get = async (req: typeof request, res: typeof response) => {
    try {
      const post = await this.postsService.get(parseInt(req.params.id, 10));
      res.status(200).json({ data: post });
    } catch (e) {
      if (e instanceof CustomError)
        res.status(e.status).json({ message: e.message });
    }
  };

  // get posts
  getAll = async (req: typeof request, res: typeof response) => {
    try {
      const defaultPage = 1;
      const defaultLimit = 6;
      const page =
        req.query.page === undefined ||
        parseInt(req.query.page.toString(), 10) < 1
          ? defaultPage
          : parseInt(req.query.page.toString(), 10);
      const limit =
        req.query.limit === undefined ||
        parseInt(req.query.limit.toString(), 10) < 1
          ? defaultLimit
          : parseInt(req.query.limit.toString(), 10);

      if (req.query.search !== undefined && req.query.search !== "") {
        res.status(200).json({
          data: await this.postsService.getAll(
            page,
            limit,
            PostsFilterType.Search,
            undefined,
            req.query.search.toString()
          ),
        });
      } else if (
        (req.query.title !== undefined && req.query.author === undefined) ||
        (req.query.author !== undefined && req.query.title === undefined)
      ) {
        const filterType =
          req.query.type === "title"
            ? PostsFilterType.Title
            : PostsFilterType.Author;
        const filterCriteria =
          req.query.author === undefined
            ? req.query.title?.toString()
            : parseInt(req.query.author.toString(), 10);
        res.status(200).json({
          data: await this.postsService.getAll(
            page,
            limit,
            filterType,
            filterCriteria
          ),
        });
      } else {
        res
          .status(200)
          .json({ data: await this.postsService.getAll(page, limit) });
      }
    } catch (e) {
      if (e instanceof CustomError)
        res.status(e.status).json({ message: e.message });
    }
  };

  // post a new post
  add = async (req: typeof request, res: typeof response) => {
    const post = new Post(
      0,
      req.body.title,
      req.body.content,
      req.user.id,
      new Date(),
      new Date(),
      req.body.image
    );
    post.authorName = req.user.name;
    try {
      await this.validatorService.validate(post, true);
      res.status(200).send({ data: await this.postsService.add(post) });
    } catch (e) {
      if (e instanceof CustomError)
        res.status(e.status).json({ message: e.message });
    }
  };

  // put - change a post
  update = async (req: typeof request, res: typeof response) => {
    const post = new Post(
      parseInt(req.params.id, 10),
      req.body.title,
      req.body.content,
      req.user.id,
      new Date(),
      new Date(),
      req.body.image
    );
    try {
      const validationPost = await this.postsService.get(post.id);
      this.isUserAuthorised(req.user, validationPost.author);
      await this.validatorService.validate(post, false);

      const updatedPost = await this.postsService.update(
        post.id,
        post,
        req.body.deleteImage
      );
      updatedPost.authorName = validationPost.authorName;
      res.status(200).json({
        data: updatedPost,
      });
    } catch (e) {
      if (e instanceof CustomError)
        res.status(e.status).json({ message: e.message });
    }
  };

  // delete post by id
  delete = async (req: typeof request, res: typeof response) => {
    try {
      const validationPost = await this.postsService.get(
        parseInt(req.params.id, 10)
      );
      this.isUserAuthorised(req.user, validationPost.author);
      await this.postsService.delete(parseInt(req.params.id, 10));
      res.status(200).json({
        postId: parseInt(req.params.id, 10),
        message: "The post and its corresponding comments were deleted.",
      });
      return;
    } catch (e) {
      if (e instanceof CustomError)
        res.status(e.status).json({ message: e.message });
    }
  };
}
