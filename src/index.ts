import express, { json } from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = 3000;
app.use(json());
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
import { authRouter } from "./routes/auth.routes";
app.get("/api/v1/auth", authRouter);
app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
