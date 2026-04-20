const express = require("express");
const app = express();
const Db = require("./Config/DataBase");
const router = require("./Modules/Router/UserRouter");

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(maxRetries: number = 5): Promise<boolean> {
  for (let i = 1; i <= maxRetries; i++) {
    const Db = require("./Config/DataBase");

    if (Db) {
      console.log("Database Connected");
      return true;
    }

    console.log(`Connection failed. Retrying (${i}/${maxRetries})...`);
    await delay(5000);
  }

  console.log("Database connection failed after", maxRetries, "attempts");
  return false;
}

connectWithRetry();
// console.log("userRoutes is:", router.default);

app.use("/api/Ts/v1", router.default);

app.listen(port, (): void => {
  console.log(`Server is running on port ${port}`);
});
