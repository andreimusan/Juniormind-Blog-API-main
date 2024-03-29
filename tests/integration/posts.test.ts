import supertest from "supertest";
import fs from "fs";
import app from "../../app";
import { posts, comments, users } from "../../inmemDB";
import Post from "../../models/DTO/post";
import Comment from "../../models/DTO/comment";
import User from "../../models/DTO/user";

beforeAll(async () => {
  await supertest(app).post("/api/setup").send({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "juniorblogapi",
  });
});

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBsb2NhbGhvc3QuY29tIiwidXNlcklkIjoxLCJpc0FkbWluIjp0cnVlLCJhY3RpdmUiOnRydWUsImlhdCI6MTY1MTEzNDkxOS4yNjcsImV4cCI6NjE2NTExMzQ4NTl9.MtUN5JBqVNhNFrMFO6N7xVKymnYw-97pU35joBxocAA";

describe("GET", () => {
  beforeAll(() => {
    const post4 = new Post(
      4,
      "post4 title",
      "post4 text",
      1,
      new Date(),
      new Date()
    );
    const post5 = new Post(
      5,
      "post5 title",
      "post5 text",
      2,
      new Date(),
      new Date()
    );
    const post6 = new Post(
      6,
      "post6 title",
      "post6 text",
      2,
      new Date(),
      new Date()
    );
    const post7 = new Post(
      7,
      "post7 title",
      "post7 text",
      1,
      new Date(),
      new Date()
    );
    posts.push(post4, post5, post6, post7);
  });

  afterAll(() => {
    posts.splice(3, 4);
  });

  test("should respond with first 6 posts if page and limit are undefined", async () => {
    const response = await supertest(app).get("/api/posts");
    expect(response.body.data.posts[0].title).toEqual("post1");
    expect(response.body.data.posts[1].title).toEqual("post2");
    expect(response.body.data.posts[2].title).toEqual("post3");
    expect(response.body.data.posts[3].title).toEqual("post4 title");
    expect(response.body.data.posts[4].title).toEqual("post5 title");
    expect(response.body.data.posts[5].title).toEqual("post6 title");
    expect(response.body.data.posts.length).toEqual(6);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with posts on page 1 with limit 2", async () => {
    const response = await supertest(app).get("/api/posts?page=1&limit=2");
    expect(response.body.data.posts[0].title).toEqual("post1");
    expect(response.body.data.posts[1].title).toEqual("post2");
    expect(response.body.data.posts.length).toEqual(2);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with posts on page 2 with limit 2", async () => {
    const response = await supertest(app).get("/api/posts?page=2&limit=2");
    expect(response.body.data.posts[0].title).toEqual("post3");
    expect(response.body.data.posts[1].title).toEqual("post4 title");
    expect(response.body.data.posts.length).toEqual(2);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with epmty array if no posts on page 5 given limit 3", async () => {
    const response = await supertest(app).get("/api/posts?page=5&limit=3");
    expect(response.body.data.posts).toEqual([]);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with first 6 posts if limit is not set", async () => {
    const response = await supertest(app).get("/api/posts?page=1");
    expect(response.body.data.posts[0].title).toEqual("post1");
    expect(response.body.data.posts[1].title).toEqual("post2");
    expect(response.body.data.posts[2].title).toEqual("post3");
    expect(response.statusCode).toBe(200);
  });

  test("should respond with first 2 posts if page is undefined and limit is 2", async () => {
    const response = await supertest(app).get("/api/posts?limit=2");
    expect(response.body.data.posts[0].title).toEqual("post1");
    expect(response.body.data.posts[1].title).toEqual("post2");
    expect(response.body.data.posts.length).toEqual(2);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with first 6 posts matching post title search", async () => {
    const response = await supertest(app).get("/api/posts?search=title");
    expect(response.body.data.posts[0].title).toEqual("post4 title");
    expect(response.body.data.posts[1].title).toEqual("post5 title");
    expect(response.body.data.posts[2].title).toEqual("post6 title");
    expect(response.body.data.posts[3].title).toEqual("post7 title");
    expect(response.body.data.posts.length).toEqual(4);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with first 6 posts matching post content search", async () => {
    const response = await supertest(app).get("/api/posts?search=text");
    expect(response.body.data.posts[0].title).toEqual("post1");
    expect(response.body.data.posts[1].title).toEqual("post2");
    expect(response.body.data.posts[2].title).toEqual("post3");
    expect(response.body.data.posts[3].title).toEqual("post4 title");
    expect(response.body.data.posts[4].title).toEqual("post5 title");
    expect(response.body.data.posts[5].title).toEqual("post6 title");
    expect(response.body.data.posts.length).toEqual(6);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with error if no post match the search", async () => {
    const response = await supertest(app).get("/api/posts?search=post333");
    expect(response.body.message).toEqual(
      "There are no posts with given filter criteria."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should respond with first 2 posts that match the search", async () => {
    const response = await supertest(app).get(
      "/api/posts?page=1&limit=2&search=post"
    );
    expect(response.body.data.posts[0].title).toEqual("post1");
    expect(response.body.data.posts[1].title).toEqual("post2");
    expect(response.body.data.posts.length).toEqual(2);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with post with corresponding id", async () => {
    const response = await supertest(app).get("/api/posts/1");
    expect(response.body.data.id).toEqual(1);
    expect(response.body.data.title).toEqual("post1");
    expect(response.body.data.content).toEqual("post1 text");
    expect(response.statusCode).toBe(200);
  });

  test("should respond with post with corresponding title", async () => {
    const response = await supertest(app).get(
      "/api/posts/?type=title&title=post3"
    );
    expect(response.body.data.posts[0].id).toEqual(3);
    expect(response.body.data.posts[0].title).toEqual("post3");
    expect(response.statusCode).toBe(200);
  });

  test("should respond with post with corresponding author", async () => {
    const response = await supertest(app).get(
      "/api/posts/?type=author&author=2"
    );
    expect(response.body.data.posts[0].id).toEqual(2);
    expect(response.body.data.posts[1].id).toEqual(3);
    expect(response.body.data.posts[0].author).toEqual(2);
    expect(response.body.data.posts[1].author).toEqual(2);
    expect(response.statusCode).toBe(200);
  });

  test("should return an error if given post id doesn't exist", async () => {
    const response = await supertest(app).get("/api/posts/1234");
    expect(response.body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should return an error if there is no post with given author id", async () => {
    const response = await supertest(app).get(
      "/api/posts/?type=author&author=1000"
    );
    expect(response.body.message).toEqual(
      "There are no posts with given filter criteria."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should return an error if there is no post with given title", async () => {
    const response = await supertest(app).get(
      "/api/posts/?type=title&title=test"
    );
    expect(response.body.message).toEqual(
      "There are no posts with given filter criteria."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should return an error if given post id is not a number", async () => {
    const response = await supertest(app).get("/api/posts/abc");
    expect(response.body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should return an error if given author id is not a number", async () => {
    const response = await supertest(app).get(
      "/api/posts/?type=author&author=abc"
    );
    expect(response.body.message).toEqual(
      "There are no posts with given filter criteria."
    );
    expect(response.statusCode).toBe(404);
  });
});

describe("POST", () => {
  afterEach(() => {
    posts.splice(3, 1);
    users.splice(3, 1);
  });

  test("should respond with error if required elements are not provided", async () => {
    const post = {
      title: "new post",
      author: 1,
    };
    const response = await supertest(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual(
      "The post elements should have a value."
    );
  });

  test("should respond with error if token is invalid", async () => {
    const post = {
      title: "new post",
      content: "new content",
      author: 1,
    };
    const response = await supertest(app)
      .post("/api/posts")
      .set("Authorization", "Bearer invalidToken")
      .send(post);
    expect(response.body.message).toEqual("Unauthorized");
    expect(response.statusCode).toBe(401);
  });

  test("should add the post to posts", async () => {
    const post = {
      title: "new post",
      content: "new content",
      author: 1,
    };
    const response = await supertest(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.body.data.title).toEqual(post.title);
    expect(response.body.data.content).toEqual(post.content);
    expect(response.body.data.author).toEqual(post.author);
    expect(response.statusCode).toBe(200);
    const newPost = await supertest(app).get(
      "/api/posts/?type=title&title=new post"
    );
    expect(newPost.body.data.posts[0].title).toEqual(post.title);
    expect(newPost.body.data.posts[0].content).toEqual(post.content);
    expect(newPost.body.data.posts[0].author).toEqual(post.author);
  });
});

describe("PUT", () => {
  beforeEach(() => {
    const newUser2 = new User(
      400,
      "alex",
      "alex@yahoo.com",
      "pass",
      true,
      new Date(),
      new Date()
    );
    newUser2.active = false;
    users.push(newUser2);
    posts.push(new Post(4, "post4", "post4 text", 3, new Date(), new Date()));
    posts.push(new Post(5, "post5", "post5 text", 300, new Date(), new Date()));
    posts.push(new Post(6, "post5", "post5 text", 400, new Date(), new Date()));
  });

  afterEach(() => {
    posts.splice(3, 3);
    users.splice(3, 1);
  });

  test("should respond with error if given id is wrong", async () => {
    const post = {
      title: "new title for post #15",
      content: "new content for post #15",
      author: 3,
    };
    const response = await supertest(app)
      .put("/api/posts/15")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should respond with error if given id is not a number", async () => {
    const post = {
      title: "new title for post #abc",
      content: "new content for post #abc",
      author: 3,
    };
    const response = await supertest(app)
      .put("/api/posts/abc")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should respond with error if required fields have no value.", async () => {
    const post = {
      title: "",
      content: "",
    };
    const response = await supertest(app)
      .put("/api/posts/4")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.body.message).toEqual(
      "The post elements should have a value."
    );
    expect(response.statusCode).toBe(400);
  });

  test("should respond with error if token is invalid", async () => {
    const post = {
      title: "new post",
      content: "new content",
    };
    const response = await supertest(app)
      .put("/api/posts/5")
      .set("Authorization", "Bearer invalidToken")
      .send(post);
    expect(response.body.message).toEqual("Unauthorized");
    expect(response.statusCode).toBe(401);
  });

  test("should update only the field requested to change", async () => {
    const post = {
      title: "new title for post #4",
    };
    const response = await supertest(app)
      .put("/api/posts/4")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.title).toEqual(post.title);
    expect(response.body.data.content).toEqual("post4 text");
  });

  test("should update all fields that are requested to change", async () => {
    const post = {
      title: "new title for post #4",
      content: "new content for post#4",
    };
    const response = await supertest(app)
      .put("/api/posts/4")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.body.data.title).toEqual(post.title);
    expect(response.body.data.content).toEqual(post.content);
    expect(response.statusCode).toBe(200);
  });

  test("should add image to post", async () => {
    const image = await supertest(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", "images/defaultPostImage.png");
    const base64Image = Buffer.from(
      fs.readFileSync("images/defaultPostImage.png")
    ).toString("base64");
    const post = {
      image: image.body.data,
    };
    const response = await supertest(app)
      .put("/api/posts/4")
      .set("Authorization", `Bearer ${authToken}`)
      .send(post);
    expect(response.body.data.image).toEqual(base64Image);
    expect(response.statusCode).toBe(200);
  });
});

describe("DELETE", () => {
  beforeEach(() => {
    posts.push(new Post(4, "post4", "post4 text", 3, new Date(), new Date()));
    comments.push(
      new Comment(
        5,
        4,
        "this coment is related to post #4",
        2,
        undefined,
        new Date(),
        new Date()
      ),
      new Comment(
        6,
        4,
        "this coment is related to post #4 and comment #5",
        1,
        5,
        new Date(),
        new Date()
      )
    );
  });

  afterEach(() => {
    posts.splice(3, 1);
    comments.splice(4, 2);
  });

  test("should respond with an error if given id does not exist", async () => {
    const response = await supertest(app)
      .delete("/api/posts/123")
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(response.statusCode).toBe(404);
  });

  test("should delete the post with given id and corresponding comments", async () => {
    const response = await supertest(app)
      .delete("/api/posts/4")
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.body.message).toEqual(
      "The post and its corresponding comments were deleted."
    );
    expect(posts.length).toEqual(3);
    expect((await supertest(app).get("/api/posts/4")).body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(comments.length).toEqual(4);
    expect((await supertest(app).get("/api/comments/5")).body.message).toEqual(
      "The comment with the given id does not exist."
    );
    expect((await supertest(app).get("/api/comments/6")).body.message).toEqual(
      "The comment with the given id does not exist."
    );
  });

  test("should respond with error if given id is not a number", async () => {
    const response = await supertest(app)
      .delete("/api/posts/a")
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.body.message).toEqual(
      "The post with the given ID does not exist."
    );
    expect(response.statusCode).toBe(404);
  });
});
