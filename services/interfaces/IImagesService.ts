/* eslint-disable no-unused-vars */
import express from "express";

export default interface IImagesService {
  add(req: express.Request, res: express.Response): Promise<string>;
  delete(imageName: string): Promise<void>;
}
