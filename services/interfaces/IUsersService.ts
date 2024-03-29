/* eslint-disable no-unused-vars */
import User from "../../models/DTO/user";

export default interface IUsersService {
  getAll(
    page: number,
    limit: number,
    email?: string,
    search?: string
  ): Promise<{ users: User[]; count: number }>;
  get(id: number): Promise<User>;
  add(user: User): Promise<User>;
  update(id: number, user: User): Promise<User>;
  delete(
    id: number,
    deletePosts: boolean,
    deleteComments: boolean
  ): Promise<User>;
}
