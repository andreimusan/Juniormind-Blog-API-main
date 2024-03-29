import bcrypt from "bcrypt";
import { users, posts, comments } from "../inmemDB";
import User from "../models/DTO/user";
import IUsersService from "./interfaces/IUsersService";
import CustomError from "./validators/customError";

export default class UsersService implements IUsersService {
  private users: User[];

  constructor() {
    this.users = users;
  }

  private static deletePostsByAuthor(author: number) {
    for (let i = 0; i < posts.length; i += 1) {
      if (posts[i].author === author) {
        UsersService.deleteCommentsByPostID(posts[i].id);
        posts.splice(i, 1);
        i -= 1;
      }
    }
  }

  private static deleteCommentsByPostID(postID: number) {
    const postComments = comments.filter((c) => c.postID === postID);
    postComments.forEach((c) => comments.splice(comments.indexOf(c), 1));
  }

  private static deleteCommentsByAuthor(author: number) {
    const authorComments = comments.filter((c) => c.author === author);
    authorComments.forEach((c) => UsersService.deleteCommentReplies(c.id));
    authorComments.forEach((c) => comments.splice(comments.indexOf(c), 1));
  }

  private static deleteCommentReplies(id: number) {
    const commentReplies = comments.filter((c) => c.parentID === id);
    commentReplies.forEach((c) => comments.splice(comments.indexOf(c), 1));
  }

  // eslint-disable-next-line no-unused-vars
  async getAll(
    page: number,
    limit: number,
    email: string = "",
    search: string = ""
  ) {
    try {
      let response: User[];
      const skip = (page - 1) * limit;
      const end = page * limit;
      if (email !== "") {
        response = this.users.filter((u) => u.email === email);
        return {
          users: response.slice(skip, end),
          count: response.length,
        };
      }

      if (search !== "") {
        response = this.users.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
        return {
          users: response.slice(skip, end),
          count: response.length,
        };
      }

      response = this.users;
      return {
        users: response.slice(skip, end),
        count: response.length,
      };
    } catch {
      throw new CustomError(400, "Error while trying to retrieve users.");
    }
  }

  async get(id: number) {
    try {
      const user = this.users.find((u) => u.id === id);
      if (!user)
        throw new CustomError(
          404,
          "The user with the given id does not exist."
        );
      return user;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while trying to retrieve user.");
    }
  }

  async add(user: User) {
    try {
      const filteredUsers = await this.users.filter(
        (u) => u.email === user.email.toString()
      );
      if (filteredUsers && filteredUsers.length !== 0)
        throw new CustomError(
          400,
          "An user with the specified email already exists."
        );

      const newUser = new User(
        this.users.length === 0 ? 1 : this.users[this.users.length - 1].id + 1,
        user.name,
        user.email,
        user.password,
        user.isAdmin,
        new Date(),
        new Date()
      );
      const saltRounds = 10;
      bcrypt.hash(user.password, saltRounds, (err, hash) => {
        newUser.password = hash;
        if (err) {
          throw new CustomError(400, "Password could not be hashed.");
        }
      });
      if (user.image !== undefined && user.image !== "")
        newUser.image = user.image;

      this.users.push(newUser);
      return newUser;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while adding new user.");
    }
  }

  async update(id: number, user: User) {
    try {
      const updatedUser = await this.get(id);
      if (updatedUser) {
        if (user.name !== undefined) updatedUser.name = user.name;
        if (user.email !== undefined) updatedUser.email = user.email;
        if (user.password !== undefined)
          updatedUser.password = bcrypt.hashSync(
            user.password,
            bcrypt.genSaltSync()
          );
        if (user.isAdmin !== undefined) updatedUser.isAdmin = user.isAdmin;
        if (
          (user.image !== undefined && user.image !== "") ||
          (user.image === "" && updatedUser.image !== "")
        )
          updatedUser.image = user.image;
        updatedUser.dateModified = new Date();
      }

      return updatedUser;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while updating the user.");
    }
  }

  async delete(id: number, deletePosts: boolean, deleteComments: boolean) {
    try {
      const user = await this.get(id);
      user.active = false;
      if (deletePosts) UsersService.deletePostsByAuthor(user.id);
      if (deleteComments) UsersService.deleteCommentsByAuthor(user.id);
      return user;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while removing the user.");
    }
  }
}
