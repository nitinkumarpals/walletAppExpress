"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var import_express2 = __toESM(require("express"));
var import_dotenv = __toESM(require("dotenv"));

// src/routes/auth.routes.ts
var import_express = require("express");

// src/prisma/prismaClient.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/schemas/signUpSchema.ts
var import_zod = require("zod");
var signUpSchema = import_zod.z.object({
  name: import_zod.z.string().min(1, "Name is Required").optional(),
  email: import_zod.z.string().email("Invalid email address"),
  password: import_zod.z.string().min(8, "Password must be at least 8 characters long")
});

// src/controllers/authController.ts
var import_crypto = __toESM(require("crypto"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var registerUser = (req, res) => __async(void 0, null, function* () {
  try {
    const body = req.body;
    const parsedBody = signUpSchema.safeParse(body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + parsedBody.error.errors.map((err) => `${err.path[0]} ${err.message}`)
      });
    }
    const { email, name, password } = parsedBody.data;
    const secureToken = import_crypto.default.randomBytes(16).toString("hex");
    const hashedPassword = yield import_bcryptjs.default.hash(password, 10);
    const existingUser = yield prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }]
      }
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Exist"
      });
    }
    const user = yield prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });
    const token = import_jsonwebtoken.default.sign(
      {
        email: user.email,
        id: user.id
      },
      process.env.JWT_SECRET || ""
    );
    if (!user) {
      throw new Error("Error in creating user");
    } else {
      return res.status(200).json({
        success: true,
        message: "User created successfully",
        id: user.id.toString(),
        name: user.name,
        email: user.email
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

// src/routes/auth.routes.ts
var authRouter = (0, import_express.Router)();
authRouter.post("/signup", registerUser);

// src/index.ts
import_dotenv.default.config();
var app = (0, import_express2.default)();
var port = 3e3;
app.use((0, import_express2.json)());
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
app.get("/api/v1/auth", authRouter);
app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
