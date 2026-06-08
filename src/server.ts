import express, { Request, Response } from "express";
import { config } from "./config";
import { initialDatabase } from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import { organizationRouter } from "./modules/organization/organization.routes";

const app = express()
const port = config.PORT

// parser 
app.use(express.json());

// db initialization 
initialDatabase();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organization", organizationRouter);

app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true, 
    message: "Resource Management Server is Alive"
  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
