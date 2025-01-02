import express, { json } from "express";
const app = express();
const port = 3000;
app.use(json());
app.get("/", (req, res) => {
  res.json({ message: "Okewree" });
});
app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
