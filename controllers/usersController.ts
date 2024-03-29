import express from "express";
import ServiceInjector from "../services/serviceInjector";
import IUsersService from "../services/interfaces/IUsersService";
import User from "../models/DTO/user";
import IUserValidatorService from "../services/interfaces/IUsersValidatorService";
import CustomError from "../services/validators/customError";

export default class UsersController {
  private users: IUsersService;

  private userValidator: IUserValidatorService;

  constructor(
    usersService: IUsersService = ServiceInjector.getService<IUsersService>(
      "IUsersService"
    ),
    userValidatorService: IUserValidatorService = ServiceInjector.getService<IUserValidatorService>(
      "IUsersValidatorService"
    )
  ) {
    this.users = usersService;
    this.userValidator = userValidatorService;
  }

  private static isAdminOrOwnerCheck = (req: express.Request) => {
    if (req.user?.isAdmin || parseInt(req.params.id, 10) === req.user?.id) {
      return;
    }

    throw new CustomError(403, "Forbidden");
  };

  getAll = async (req: express.Request, res: express.Response) => {
    let allUsers;
    try {
      const defaultPage = 1;
      const defaultLimit = 5;
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
        allUsers = await this.users.getAll(
          page,
          limit,
          undefined,
          req.query.search.toString()
        );
      } else if (req.query.email !== undefined) {
        allUsers = await this.users.getAll(
          page,
          limit,
          req.query.email.toString()
        );
      } else {
        allUsers = await this.users.getAll(page, limit);
      }
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ data: allUsers, message: "Users successfully retrieved." });
  };

  get = async (req: express.Request, res: express.Response) => {
    let user;
    try {
      UsersController.isAdminOrOwnerCheck(req);
      user = await this.users.get(parseInt(req.params.id, 10));
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ data: user, message: "User successfully retrieved." });
  };

  post = async (req: express.Request, res: express.Response) => {
    let addedUser;
    try {
      const userRequest = new User(
        0,
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.isAdmin
      );
      if (req.body.image !== "") {
        userRequest.image = req.body.image;
      }

      this.userValidator.validateUser(userRequest);
      addedUser = await this.users.add(userRequest);
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res.status(201).json({ data: addedUser, message: "User added." });
  };

  update = async (req: express.Request, res: express.Response) => {
    let updatedUser;
    try {
      UsersController.isAdminOrOwnerCheck(req);
      const userRequest = new User(
        0,
        req.body.name,
        req.body.email,
        req.body.password,
        req.user?.isAdmin ? req.body.isAdmin : req.user?.isAdmin,
        req.body.dateCreated,
        req.body.dateModified,
        req.body.active,
        req.body.image
      );
      this.userValidator.validateUser(userRequest, req.params.id.toString());
      updatedUser = await this.users.update(
        parseInt(req.params.id, 10),
        userRequest
      );
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res
      .status(200)
      .json({ data: updatedUser, message: "User updated." });
  };

  delete = async (req: express.Request, res: express.Response) => {
    let postsMessage = "";
    let user;
    try {
      UsersController.isAdminOrOwnerCheck(req);
      const deletePosts =
        req.query.deletePosts?.toString().toLocaleLowerCase() === "yes";
      if (deletePosts) postsMessage += " and posts deleted";

      const deleteComments =
        req.query.deleteComments?.toString().toLowerCase() === "yes";
      if (deleteComments) postsMessage += " and comments deleted";

      user = await this.users.delete(
        parseInt(req.params.id, 10),
        deletePosts,
        deleteComments
      );
    } catch (e) {
      if (e instanceof CustomError)
        return res.status(e.status).json({ message: e.message });
    }

    return res.status(200).json({
      data: user,
      message: `User status set to inactive${postsMessage}.`,
    });
  };

  get usersService() {
    return this.users;
  }
}
