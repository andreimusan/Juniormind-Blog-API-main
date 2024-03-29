/* eslint-disable no-unused-vars */
import { posts, comments } from "../inmemDB";
import Post from "../models/DTO/post";
import PostsFilterType from "./filters/postsFilterType";
import IPostsService from "./interfaces/IPostsService";
import CustomError from "./validators/customError";

export default class PostsService implements IPostsService {
  private posts: Post[];

  constructor() {
    this.posts = posts;
  }

  getAll = async (
    page: number,
    limit: number,
    type: PostsFilterType = PostsFilterType.None,
    data: string | number = "",
    search: string = ""
  ) => {
    let filteredPosts;
    const start = (page - 1) * limit;
    const end = page * limit;
    switch (type) {
      case PostsFilterType.Author:
        filteredPosts = this.posts.filter((p) => p.author === data);
        break;
      case PostsFilterType.Title:
        filteredPosts = this.posts.filter((p) => p.title === data);
        break;
      case PostsFilterType.Search:
        filteredPosts = this.posts.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.content.toLowerCase().includes(search)
        );
        break;
      default:
        filteredPosts = this.posts;
    }

    if (filteredPosts !== undefined && filteredPosts.length > 0) {
      return {
        posts: filteredPosts.slice(start, end),
        count: this.posts.length,
      };
    }

    throw new CustomError(
      404,
      "There are no posts with given filter criteria."
    );
  };

  get = async (id: number) => {
    const post = this.posts.find((p) => p.id === id);
    if (post === undefined) {
      throw new CustomError(404, "The post with the given ID does not exist.");
    }

    return post;
  };

  add = async (post: Post) => {
    const newPost = post;
    newPost.id =
      this.posts.length === 0 ? 1 : this.posts[this.posts.length - 1].id + 1;
    this.posts.push(post);
    return newPost;
  };

  update = async (
    id: number,
    updatedPost: Post,
    deleteImage: boolean = false
  ) => {
    const post = this.posts.find((p) => p.id === id);
    if (post === undefined) {
      throw new CustomError(404, "The post with the given ID does not exist.");
    }
    post.content =
      updatedPost.content === undefined ? post.content : updatedPost.content;
    post.title =
      updatedPost.title === undefined ? post.title : updatedPost.title;
    post.dateModified = updatedPost.dateModified;
    post.image =
      updatedPost.image === undefined ? post.image : updatedPost.image;
    return post;
  };

  delete = async (id: number) => {
    const post = this.posts.find((p) => p.id === id);
    if (post === undefined) {
      throw new CustomError(404, "The post with the given ID does not exist.");
    }

    const postComments = comments.filter((c) => c.postID === id);
    postComments.forEach((c) => comments.splice(comments.indexOf(c), 1));
    if (post !== undefined) {
      const postIndex = posts.indexOf(post);
      posts.splice(postIndex, 1);
    }
  };
}
