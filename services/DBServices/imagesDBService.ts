/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import express from "express";
import fs from "fs";
import { promisify } from "util";
import { MulterError } from "multer";
import IImagesService from "../interfaces/IImagesService";
import CustomError from "../validators/customError";
import { uploadFile } from "../../middlewares/fileUpload";

export default class ImagesDBService implements IImagesService {
  add = async (
    req: express.Request,
    res: express.Response
  ): Promise<string> => {
    let imagePath = "";
    try {
      await uploadFile(req, res);
      if (req.file !== undefined) imagePath = req.file.filename;
    } catch (error) {
      if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE")
        throw new CustomError(400, "File size cannot be larger than 2MB!");
      if (error instanceof Error && error.message === "LIMIT_FILE_TYPE")
        throw new CustomError(400, "Images only!");

      throw new CustomError(400, (error as Error).message);
    }

    return imagePath;
  };

  delete = async (imageName: string): Promise<void> => {
    try {
      if (imageName === "defaultPostImage.png") return;

      if (!fs.existsSync(`images/${imageName}`)) {
        throw new CustomError(404, "File not found.");
      }

      const unlinkAsync = promisify(fs.unlink);
      await unlinkAsync(`images/${imageName}`);
    } catch (error) {
      throw new CustomError(400, (error as Error).message);
    }
  };
}
