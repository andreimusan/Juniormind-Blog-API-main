/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import express from "express";
import { MulterError } from "multer";
import path from "path";
import { addFileToRequest } from "../middlewares/fileUpload";
import IImagesService from "./interfaces/IImagesService";
import CustomError from "./validators/customError";

export default class ImagesService implements IImagesService {
  add = async (req: express.Request, res: express.Response) => {
    try {
      await addFileToRequest(req, res);
      if (req.file === undefined)
        throw new CustomError(404, "There is no image attached.");
      const encoded = req.file.buffer.toString("base64");
      if (encoded === undefined)
        throw new CustomError(
          400,
          "Something went wrong while converting the image to base64"
        );

      return encoded;
    } catch (error) {
      if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE")
        throw new CustomError(400, "File size cannot be larger than 2MB!");
      if (error instanceof Error && error.message === "LIMIT_FILE_TYPE")
        throw new CustomError(400, "Images only!");

      throw new CustomError(400, (error as Error).message);
    }
  };

  delete = () => {
    throw new Error("Not implemented.");
  };
}
