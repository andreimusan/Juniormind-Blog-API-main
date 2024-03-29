/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import CustomError from "../validators/customError";

export enum commentsFilter {
  post,
  author,
  parent,
  search,
}

export function chooseFilter(filter: string) {
  switch (filter.toLowerCase()) {
    case "post":
      return commentsFilter.post;
    case "author":
      return commentsFilter.author;
    case "parent":
      return commentsFilter.parent;
    case "search":
      return commentsFilter.search;
    default:
      throw new CustomError(
        400,
        "Input parameters were incomplete or incorrect."
      );
  }
}
