import User from "../models/DTO/user";
import Post from "../models/DTO/post";
import Comment from "../models/DTO/comment";
import { users, posts, comments } from "../inmemDB";
import { commentsFilter } from "./filters/commentsFilter";
import ICommentsService from "./interfaces/ICommentsService";
import CustomError from "./validators/customError";

export default class CommentsService implements ICommentsService {
  users: User[];

  posts: Post[];

  comments: Comment[];

  constructor() {
    this.users = users;
    this.posts = posts;
    this.comments = comments;
  }

  private async removeReplies(id: number) {
    const commentReplies = this.comments.filter((c) => c.parentID === id);
    commentReplies.forEach((c) => comments.splice(comments.indexOf(c), 1));
  }

  private async removeAllWithPostID(postID: number) {
    const postComments = this.comments.filter((c) => c.postID === postID);
    postComments.forEach((c) => comments.splice(comments.indexOf(c), 1));
  }

  private async removeAllWithAuthor(author: number) {
    const authorComments = comments.filter((c) => c.author === author);
    authorComments.forEach((c) => this.removeReplies(c.id));
    authorComments.forEach((c) => comments.splice(comments.indexOf(c), 1));
  }

  private async findById(id: number) {
    return this.comments.find((comment) => comment.id === id);
  }

  private async newElementId() {
    return this.comments.length === 0
      ? 1
      : comments[comments.length - 1].id + 1;
  }

  private async authorExists(authorId: number) {
    const author = this.users.find((x) => x.id === authorId);

    if (!author) {
      throw new CustomError(400, "The author does not exist.");
    }
  }

  private async postExists(postId: number) {
    const post = this.posts.find((x) => x.id === postId);

    if (!post) {
      throw new CustomError(400, "The post does not exist.");
    }
  }

  private async parentBelongsToPost(
    parentId: number | undefined,
    postId: number
  ) {
    if (parentId !== undefined) {
      const parentComment = await this.findById(parentId);
      if (parentComment === undefined || parentComment.postID !== postId) {
        throw new CustomError(
          400,
          "Parent comment is not part of the same post or it does not exist"
        );
      }
    }
  }

  private async validateComment(comment: Comment) {
    if (
      comment.postID == null ||
      comment.text == null ||
      comment.author == null
    ) {
      throw new CustomError(
        400,
        "All required comment fields must have a value."
      );
    }

    try {
      await this.authorExists(comment.author);
      await this.postExists(comment.postID);
      await this.parentBelongsToPost(comment.parentID, comment.postID);
    } catch (e) {
      if (e instanceof CustomError) throw e;
    }
  }

  async get(id: number) {
    try {
      const searchedComment = await this.findById(id);
      if (!searchedComment)
        throw new CustomError(
          404,
          "The comment with the given id does not exist."
        );
      return searchedComment;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while trying to retrieve comment");
    }
  }

  async getAll(
    filter: commentsFilter,
    filterid: number,
    previousPageLastCommentIndex: number,
    limit: number,
    searchText: string = ""
  ) {
    try {
      comments.reverse();
      let filteredComments: Comment[] = [];
      switch (filter) {
        case commentsFilter.post:
          filteredComments = comments.filter((x) => x.postID === filterid);
          break;
        case commentsFilter.author:
          filteredComments = comments.filter((x) => x.author === filterid);
          break;
        case commentsFilter.parent:
          filteredComments = comments.filter(
            (x) => x.parentID != null && x.parentID === filterid
          );
          break;
        case commentsFilter.search:
          comments.forEach((comment: Comment) => {
            const searchedUser = this.users.find(
              (user: User) => user.id === comment.author
            );
            if (searchedUser) comment.authorName = searchedUser.name;
          });
          filteredComments = comments.filter(
            (x) =>
              x.postID === filterid &&
              (x.text.includes(searchText) || x.authorName.includes(searchText))
          );

          break;
        default:
          throw new CustomError(
            400,
            "Input parameters were incomplete or incorrect."
          );
      }

      const commentUpToWhichToSkip = filteredComments.find(
        (x) => x.id === previousPageLastCommentIndex
      );
      let commentUpToWhichToSkipIndex = 0;

      if (commentUpToWhichToSkip)
        commentUpToWhichToSkipIndex =
          filteredComments.indexOf(commentUpToWhichToSkip) + 1;
      else {
        commentUpToWhichToSkipIndex =
          previousPageLastCommentIndex > -1
            ? (commentUpToWhichToSkipIndex = comments.length)
            : 0;
      }
      comments.reverse();
      return {
        comments: filteredComments.slice(
          commentUpToWhichToSkipIndex,
          commentUpToWhichToSkipIndex + limit
        ),
        primaryCommentsCount: filteredComments.length,
      };
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while trying to retrieve comments");
    }
  }

  async add(commentToAdd: Comment) {
    const newComment = commentToAdd;

    try {
      await this.validateComment(newComment);
      newComment.id = await this.newElementId();
      newComment.dateCreated = new Date();
      newComment.dateModified = new Date();
      this.comments.push(newComment);
    } catch (e) {
      if (e instanceof CustomError) throw e;
    }

    return newComment;
  }

  async update(id: number, text: string) {
    try {
      const commentToUpdate = await this.get(id);
      commentToUpdate.text = text;
      commentToUpdate.dateModified = new Date();
      return commentToUpdate;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while updating the comment");
    }
  }

  async remove(id: number) {
    try {
      const commentToRemove = await this.get(id);
      this.removeReplies(id);
      this.comments.splice(comments.indexOf(commentToRemove), 1);
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while removing the comment");
    }
  }

  async removeAll(filter: commentsFilter, filterId: number) {
    try {
      switch (filter) {
        case commentsFilter.post:
          try {
            await this.removeAllWithPostID(filterId);
          } catch (e) {
            throw new CustomError(
              400,
              "Error while removing comments with specific postID"
            );
          }
          break;
        case commentsFilter.author:
          try {
            await this.removeAllWithAuthor(filterId);
          } catch (e) {
            throw new CustomError(
              400,
              "Error while removing comments with specific author"
            );
          }
          break;
        default:
          throw new CustomError(400, "Error while removing comments");
      }
    } catch (e) {
      if (e instanceof CustomError) throw e;
    }
  }
}
