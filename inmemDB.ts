import User from "./models/DTO/user";
import Post from "./models/DTO/post";
import Comment from "./models/DTO/comment";

const user1 = new User(
  1,
  "Mihai",
  "mihai@mail.com",
  "password",
  false,
  new Date(),
  new Date()
);
const user2 = new User(
  2,
  "Vlad",
  "vlad@mail.com",
  "password",
  false,
  new Date(),
  new Date()
);
const user3 = new User(
  3,
  "Maria",
  "maria@mail.com",
  "password",
  false,
  new Date(),
  new Date()
);
export const users = [user1, user2, user3];

const post1 = new Post(1, "post1", "post1 text", 1, new Date(), new Date());
const post2 = new Post(2, "post2", "post2 text", 2, new Date(), new Date());
const post3 = new Post(3, "post3", "post3 text", 2, new Date(), new Date());
export const posts = [post1, post2, post3];

const comment1 = new Comment(
  1,
  1,
  "this is comment #1",
  1,
  undefined,
  new Date(2021, 12, 19),
  new Date(2021, 12, 19)
);
const comment2 = new Comment(
  2,
  2,
  "this is comment #2",
  2,
  undefined,
  new Date(2021, 12, 20),
  new Date(2021, 12, 20)
);
const comment3 = new Comment(
  3,
  3,
  "this is comment #3",
  3,
  undefined,
  new Date(2021, 12, 20),
  new Date(2021, 12, 20)
);

const comment4 = new Comment(
  4,
  1,
  "this is comment #4",
  3,
  1,
  new Date(2021, 12, 20),
  new Date(2021, 12, 20)
);
export const comments: Comment[] = [comment1, comment2, comment3, comment4];
