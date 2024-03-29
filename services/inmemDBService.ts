/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
import IDBService from "./interfaces/IDBService";
import DBConfig from "../models/DTO/dbConfig";

export default class InmemDBService implements IDBService {
  configFileExists: boolean = false;

  // eslint-disable-next-line no-unused-vars
  public saveDBConfig = (dbConfig: DBConfig) => {
    this.configFileExists = true;
  };

  public checkDBConfig = () => this.configFileExists;

  public async connectToDB(): Promise<void> {}

  public async seedDB(): Promise<void> {}
}
