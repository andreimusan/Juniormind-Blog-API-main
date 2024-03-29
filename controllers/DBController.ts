import express from "express";
import IDBConfigValidatorService from "../services/interfaces/IDatabaseConfigValidator";
import ServiceInjector from "../services/serviceInjector";
import IDBService from "../services/interfaces/IDBService";
import DBConfig from "../models/DTO/dbConfig";

export default class DBController {
  private dbService: IDBService;

  private validatorService: IDBConfigValidatorService;

  constructor(
    validatorService: IDBConfigValidatorService = ServiceInjector.getService<IDBConfigValidatorService>(
      "IDBConfigValidatorService"
    ),
    dbService: IDBService = ServiceInjector.getService<IDBService>("IDBService")
  ) {
    this.validatorService = validatorService;
    this.dbService = dbService;
  }

  saveDBConfig = async (req: express.Request, res: express.Response) => {
    try {
      this.validatorService.validate(req.body);
      this.dbService.saveDBConfig(
        new DBConfig(
          req.body.username,
          req.body.password,
          req.body.database,
          req.body.type,
          req.body.host,
          req.body.port,
          req.body.synchronize,
          req.body.logging,
          req.body.entities
        )
      );
      await this.dbService.connectToDB();
      await this.dbService.seedDB();
    } catch (e) {
      if (e instanceof Error) {
        res.status(400).json({ message: e.message });
        return;
      }
    }

    res.status(200).json({ message: "Database configured sucessfully!" });
  };
}
