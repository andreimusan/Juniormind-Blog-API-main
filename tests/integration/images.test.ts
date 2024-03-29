import supertest from "supertest";
import fs from "fs";
import app from "../../app";

const jpgImagePath = "images/defaultPostImage.png";
const pdfFilePath = "images/testPdf.pdf";
const largeImagePath = "images/testLargeSizeImage.jpg";

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

describe("add image", () => {
  test("should add image in base64", async () => {
    const image = Buffer.from(fs.readFileSync(jpgImagePath)).toString("base64");
    const response = await supertest(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", jpgImagePath);
    expect(response.body.data).toEqual(image);
  });

  test("should return error if no file is attached", async () => {
    const response = await supertest(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.body.message).toEqual("There is no image attached.");
  });

  test("should return error if file format is not accepted", async () => {
    const response = await supertest(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", pdfFilePath);
    expect(response.body.message).toEqual("Images only!");
  });

  test("should return error if file size is too large", async () => {
    const response = await supertest(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", largeImagePath);
    expect(response.body.message).toEqual(
      "File size cannot be larger than 2MB!"
    );
  });
});
