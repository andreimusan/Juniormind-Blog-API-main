/* eslint-disable no-unused-vars */
import Post from "../../models/DTO/post";
import User from "../../models/DTO/user";
import PostsFilterType from "../filters/postsFilterType";

export default interface IPostsService {
  get(id: number): Promise<Post>;
  getAll(
    page: number,
    limit: number,
    type?: PostsFilterType,
    data?: string | number,
    search?: string
  ): Promise<{ posts: Post[]; count: number }>;
  add(post: Post, user?: User): Promise<Post>;
  update(
    id: number,
    post: Post,
    deleteImage: boolean,
    user?: User
  ): Promise<Post>;
  delete(id: number, user?: User): void;
}
