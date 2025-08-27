import neo4j, { Driver } from "neo4j-driver";
import dotenv from "dotenv";
dotenv.config();

let driver: Driver;

export const getDriver = (): Driver => {
  if (!driver) {
    const uri = process.env.NEO4J_URI!;
    const user = process.env.NEO4J_USER!;
    const password = process.env.NEO4J_PASSWORD!;
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {});
  }

  return driver;
}

export const closeDriver = async () => {
  if (driver) await driver.close();
}
