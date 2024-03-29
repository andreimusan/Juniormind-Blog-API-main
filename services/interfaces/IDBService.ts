/* eslint-disable no-unused-vars */
import DBConfig from "../../models/DTO/dbConfig";

export default interface IDBService {
  saveDBConfig(dbConfig: DBConfig): void;
  checkDBConfig(): boolean;
  connectToDB(): Promise<void>;
  seedDB(): Promise<void>;
}
