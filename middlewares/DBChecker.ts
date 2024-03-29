/* eslint-disable class-methods-use-this */
import express from "express";
import IDBService from "../services/interfaces/IDBService";
import IDBChecker from "../services/interfaces/IDBChecker";
import ServiceInjector from "../services/serviceInjector";

export default class DBChecker implements IDBChecker {
  dbService: IDBService;

  constructor(
    dbService: IDBService = ServiceInjector.getService<IDBService>("IDBService")
  ) {
    this.dbService = dbService;
  }

  public dbNotConfigured = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!this.dbService.checkDBConfig())
      res.status(500).json({
        message: "Database is not configured. Please use the setup route.",
      });
    else next();
  };

  public dbAlreadyConfigured = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (this.dbService.checkDBConfig())
      res.status(500).json({
        message: "Database is already configured.",
      });
    else next();
  };
}
