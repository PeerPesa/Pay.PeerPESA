interface Window {
    verified: boolean;
}
declare namespace NodeJS {
    interface Global {
      _mongoClientPromise: Promise<MongoClient>;
    }
  }