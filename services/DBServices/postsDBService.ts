/* eslint-disable class-methods-use-this */
import { getRepository, Repository } from "typeorm";
import { RowDataPacket } from "mysql2";
import PostEntity from "../../models/entities/postEntity";
import Post from "../../models/DTO/post";
import PostsFilterType from "../filters/postsFilterType";
import IPostsService from "../interfaces/IPostsService";
import CustomError from "../validators/customError";
import IImagesService from "../interfaces/IImagesService";
import ServiceInjector from "../serviceInjector";

export default class PostsDBService implements IPostsService {
  postsRepository!: Repository<PostEntity>;

  private imagesService: IImagesService;

  private defaultImage = "defaultPostImage.png";

  constructor(
    imagesService: IImagesService = ServiceInjector.getService<IImagesService>(
      "IImagesService"
    )
  ) {
    this.imagesService = imagesService;
  }

  private instantiateRepo() {
    if (!this.postsRepository) this.postsRepository = getRepository(PostEntity);
  }

  private convertEntityToDTO(postEntity: PostEntity): Post {
    return new Post(
      postEntity.id,
      postEntity.title,
      postEntity.content,
      postEntity.authorId,
      postEntity.dateCreated,
      postEntity.dateModified,
      postEntity.image
    );
  }

  private convertRawDBResponseToDTO(postRaw: RowDataPacket): Post {
    const post = new Post(
      postRaw.post_id,
      postRaw.post_title,
      postRaw.post_content,
      postRaw.post_authorId,
      postRaw.post_dateCreated,
      postRaw.post_dateModified,
      postRaw.post_image
    );
    post.authorName = postRaw.user_name;
    post.commentsCount = postRaw.commentsCount;
    return post;
  }

  async get(id: number) {
    this.instantiateRepo();
    let post: RowDataPacket | undefined;
    try {
      post = await this.postsRepository
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.author", "user")
        .leftJoinAndSelect("post.comments", "comments")
        .select([
          "post.id",
          "post.title",
          "post.content",
          "post.authorId",
          "post.dateCreated",
          "post.dateModified",
          "post.image",
          "user.name",
          "COUNT(DISTINCT(comments.id)) as commentsCount",
        ])
        .orderBy("post.dateCreated", "DESC")
        .where("post.id = :id", { id })
        .getRawOne();
    } catch (e) {
      if (e instanceof Error) throw new CustomError(400, e.message);
    }

    if (!post || post.post_id === null) {
      throw new CustomError(404, "The post with the given ID does not exist.");
    }

    return this.convertRawDBResponseToDTO(post);
  }

  async getAll(
    page: number,
    limit: number,
    type: PostsFilterType = PostsFilterType.None,
    data: string | number = "",
    search: string = ""
  ) {
    this.instantiateRepo();
    let dbResponse;
    const offset = (page - 1) * limit;
    try {
      const dbQuery = this.postsRepository
        .createQueryBuilder("post")
        .leftJoin("post.author", "user")
        .select([
          "post.id",
          "post.title",
          "SUBSTRING(post.content, 1, 150) AS post_content",
          "post.authorId",
          "post.dateCreated",
          "post.dateModified",
          "post.image",
          "user.name",
        ])
        .orderBy("post.dateCreated", "DESC");

      switch (type) {
        case PostsFilterType.Author:
          dbResponse = await dbQuery.where("post.authorId = :authorId", {
            authorId: data,
          });
          break;
        case PostsFilterType.Title:
          dbResponse = await dbQuery.where("post.title = :title", {
            title: data,
          });
          break;
        case PostsFilterType.Search:
          dbResponse = await dbQuery
            .where("post.title like :title", { title: `%${search}%` })
            .orWhere("post.content like :content", { content: `%${search}%` })
            .orWhere("user.name like :author", { author: `%${search}%` });
          break;
        default:
          dbResponse = dbQuery;
      }
    } catch (e) {
      if (e instanceof Error) throw new CustomError(400, e.message);
    }

    const count = await dbResponse?.getCount();
    if (!dbResponse || count === 0 || count === undefined)
      throw new CustomError(404, "No posts with input filters found.");

    if (offset >= count) throw new CustomError(404, "No posts on this page.");

    const result: RowDataPacket[] | undefined = await dbResponse
      .offset(offset)
      .limit(limit)
      .getRawMany();

    return {
      posts: result.map((c) => this.convertRawDBResponseToDTO(c)),
      count,
    };
  }

  async add(post: Post) {
    this.instantiateRepo();
    let newPost;
    try {
      newPost = await this.postsRepository.save({
        title: post.title,
        content: post.content,
        authorId: post.author,
        image: post.image === "" ? this.defaultImage : post.image,
      });
    } catch (e) {
      if (e instanceof Error) throw new CustomError(400, e.message);
    }

    if (!newPost)
      throw new CustomError(404, "The post with the given ID does not exist.");
    const convertedPost = this.convertEntityToDTO(newPost);
    convertedPost.authorName = post.authorName;
    return convertedPost;
  }

  async update(id: number, updatedPost: Post, deleteImage: boolean) {
    this.instantiateRepo();
    const post = await this.postsRepository.findOne({ where: { id } });
    if (post === undefined)
      throw new CustomError(404, "The post with the given ID does not exist.");

    if (updatedPost.image !== "") {
      this.imagesService.delete(post.image);
    }

    post.content =
      updatedPost.content === undefined ? post.content : updatedPost.content;
    post.title =
      updatedPost.title === undefined ? post.title : updatedPost.title;
    post.image =
      updatedPost.image === undefined || updatedPost.image === ""
        ? post.image
        : updatedPost.image;

    if (deleteImage) {
      post.image = this.defaultImage;
    }

    try {
      await this.postsRepository.update(id, {
        title: post.title,
        content: post.content,
        image: post.image,
      });
    } catch (e) {
      if (e instanceof CustomError) throw e;
      if (e instanceof Error) throw new CustomError(400, e.message);
    }

    const convertedPost = this.convertEntityToDTO(post);
    convertedPost.authorName = updatedPost.authorName;
    return convertedPost;
  }

  async delete(id: number) {
    this.instantiateRepo();
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post)
      throw new CustomError(404, "The post with the given ID does not exist.");
    try {
      await this.imagesService.delete(post.image);
      await this.postsRepository.delete(id);
    } catch (e) {
      if (e instanceof Error) throw new CustomError(400, e.message);
    }
  }
}
