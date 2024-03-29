import express from "express";
import IImagesService from "../services/interfaces/IImagesService";
import ServiceInjector from "../services/serviceInjector";
import CustomError from "../services/validators/customError";

export default class ImagesController {
  private imagesService: IImagesService;

  constructor(
    imagesService: IImagesService = ServiceInjector.getService<IImagesService>(
      "IImagesService"
    )
  ) {
    this.imagesService = imagesService;
  }

  add = async (req: express.Request, res: express.Response) => {
    try {
      const imagePath = await this.imagesService.add(req, res);
      return res.status(200).json({ data: imagePath });
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json({ message: error.message });

      return res.status(404).send({
        message: `Could not upload the file: ${req.file?.originalname}. ${error}`,
      });
    }
  };

  delete = async (req: express.Request, res: express.Response) => {
    try {
      await this.imagesService.delete(req.params.imageName);
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json({ message: error.message });
    }

    return res
      .status(200)
      .json({ message: `Image ${req.params.imageName} deleted.` });
  };
}
