import { request, response } from "express";
import { Duplex } from "stream";
import path from "path";
import ImagesController from "../../controllers/imagesController";
import ServicesRegister from "../../services/servicesRegister";
import User from "../../models/DTO/user";

let authorizationUser: User;
let imagesController: ImagesController;
beforeAll(() => {
  ServicesRegister.RegisterServices();
  imagesController = new ImagesController();
  authorizationUser = {
    name: "admin",
    email: "admin@localhost.com",
    password: "123456",
    id: 3,
    isAdmin: false,
    active: true,
    image: "",
  };
});

jest.mock("../../middlewares/fileUpload", () => ({
  addFileToRequest: jest.fn(() => {
    const req = request;
    if (req.body.buffer === undefined) {
      throw new Error("There is no image attached.");
    }

    const maxSize = 2 * 1024 * 1024;
    const acceptedFormats = /jpeg|jpg|png|gif|tiff/;
    const isCorrectFormat = acceptedFormats.test(
      path.extname(req.body.fileName).toLowerCase()
    );
    if (req.body.fileSize > maxSize) {
      throw new Error("File size cannot be larger than 2MB!");
    } else if (!isCorrectFormat) {
      throw new Error("Images only!");
    }

    req.file = {
      fieldname: "fieldname.test",
      originalname: req.body.fileName,
      encoding: "encoding.test",
      mimetype: "filemane.jpg",
      size: req.body.fileSize,
      destination: "destination.test",
      filename: "filename.jpg",
      buffer: req.body.buffer,
      path: "path",
      stream: new Duplex(),
    };
  }),
}));

describe("testing add", () => {
  test("should return image in base64", async () => {
    const req = request;
    const res = response;
    let responseObject;
    const buffer = Buffer.from([5, 6, 7, 10, 1]);
    req.headers = {
      "content-type": "multipart/form-data",
    };
    req.user = authorizationUser;
    req.body = { fileName: "filemane.jpg", fileSize: 1024, buffer };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.data;
    });
    res.status = jest.fn().mockReturnValue(res);
    await imagesController.add(req, res);
    expect(responseObject).toEqual(buffer.toString("base64"));
  });

  test("should return error if no image is sent", async () => {
    const req = request;
    const res = response;
    let responseObject;
    req.headers = {
      "content-type": "multipart/form-data",
    };
    req.user = authorizationUser;
    req.body = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.message;
    });
    res.status = jest.fn().mockReturnValue(res);
    await imagesController.add(req, res);
    expect(responseObject).toEqual("There is no image attached.");
  });

  test("should return error if image format is not accepted", async () => {
    const req = request;
    const res = response;
    let responseObject;
    const buffer = Buffer.from([5, 6, 7, 10, 1]);
    req.headers = {
      "content-type": "multipart/form-data",
    };
    req.user = authorizationUser;
    req.body = { fileName: "image.pdf", fileSize: 1024, buffer };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.message;
    });
    res.status = jest.fn().mockReturnValue(res);
    await imagesController.add(req, res);
    expect(responseObject).toEqual("Images only!");
  });

  test("should return error if image size is too large", async () => {
    const req = request;
    const res = response;
    let responseObject;
    const buffer = Buffer.from([5, 6, 7, 10, 1]);
    req.headers = {
      "content-type": "multipart/form-data",
    };
    req.user = authorizationUser;
    req.body = { fileName: "image.pdf", fileSize: 3 * 1024 * 1024, buffer };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.message;
    });
    res.status = jest.fn().mockReturnValue(res);
    await imagesController.add(req, res);
    expect(responseObject).toEqual("File size cannot be larger than 2MB!");
  });

  test("should return base64 image even if fileFormat is capital letters", async () => {
    const req = request;
    const res = response;
    let responseObject;
    const buffer = Buffer.from([5, 6, 7, 10, 1]);
    req.headers = {
      "content-type": "multipart/form-data",
    };
    req.user = authorizationUser;
    req.body = { fileName: "image.JPG", fileSize: 1024, buffer };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.data;
    });
    res.status = jest.fn().mockReturnValue(res);
    await imagesController.add(req, res);
    expect(responseObject).toEqual(buffer.toString("base64"));
  });
});
