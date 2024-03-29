export default class UserComment {
  id: number;

  postID: number;

  text: string;

  author: number;

  parentID?: number;

  dateCreated?: Date;

  dateModified?: Date;

  authorName!: string;

  repliesCount!: number;

  constructor(
    id: number,
    postID: number,
    text: string,
    author: number,
    parentID?: number,
    dateCreated?: Date,
    dateModified?: Date
  ) {
    this.id = id;
    this.postID = postID;
    this.text = text;
    this.author = author;
    this.dateCreated = dateCreated;
    this.dateModified = dateModified;
    this.parentID = parentID;
  }
}
