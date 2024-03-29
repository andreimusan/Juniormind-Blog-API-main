/* eslint-disable no-unused-vars */
import express from "express";

export default interface IDBChecker {
  dbNotConfigured(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void;
  dbAlreadyConfigured(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void;
}
