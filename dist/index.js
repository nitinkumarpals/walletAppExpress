"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// src/prisma/prismaClient.ts
var import_client, prisma;
var init_prismaClient = __esm({
  "src/prisma/prismaClient.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    prisma = new import_client.PrismaClient();
  }
});

// src/utils/authUtils.ts
var import_bcryptjs, verifyCallback;
var init_authUtils = __esm({
  "src/utils/authUtils.ts"() {
    "use strict";
    import_bcryptjs = __toESM(require("bcryptjs"));
    init_prismaClient();
    verifyCallback = (email, password, done) => __async(void 0, null, function* () {
      try {
        const user = yield prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, password: true }
        });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isMatch = yield import_bcryptjs.default.compare(password, user.password);
        if (!isMatch) {
          return done(null, null, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    });
  }
});

// src/config/passport.ts
var require_passport = __commonJS({
  "src/config/passport.ts"(exports2) {
    "use strict";
    var import_passport4 = __toESM(require("passport"));
    var import_passport_local = require("passport-local");
    init_authUtils();
    init_prismaClient();
    import_passport4.default.use(
      new import_passport_local.Strategy(
        {
          usernameField: "email",
          passwordField: "password"
        },
        verifyCallback
      )
    );
    import_passport4.default.serializeUser((user, done) => {
      if (user) {
        return done(null, user.id);
      }
      return done(null, false);
    });
    import_passport4.default.deserializeUser((id, done) => __async(exports2, null, function* () {
      try {
        const user = yield prisma.user.findUnique({
          where: { id: Number(id) }
        });
        done(null, user);
      } catch (error) {
        done(error);
      }
    }));
  }
});

// src/index.ts
var import_express2 = __toESM(require("express"));
var import_express_session = __toESM(require("express-session"));
var import_passport2 = __toESM(require("passport"));
var import_dotenv = __toESM(require("dotenv"));
var import_passport3 = __toESM(require_passport());

// src/routes/auth.routes.ts
var import_express = require("express");

// src/controllers/authController.ts
init_prismaClient();

// src/schemas/signUpSchema.ts
var import_zod = require("zod");
var signUpSchema = import_zod.z.object({
  name: import_zod.z.string().min(1, "Name is Required").optional(),
  email: import_zod.z.string().email("Invalid email address"),
  password: import_zod.z.string().min(8, "Password must be at least 8 characters long")
});

// src/controllers/authController.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var registerUser = (req, res) => __async(void 0, null, function* () {
  try {
    const body = req.body;
    const parsedBody = signUpSchema.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message: "Validation error: " + parsedBody.error.errors.map((err) => `${err.path[0]} ${err.message}`)
      });
      return;
    }
    const { email, name, password } = parsedBody.data;
    const hashedPassword = yield import_bcryptjs2.default.hash(password, 10);
    const existingUser = yield prisma.user.findFirst({
      where: {
        OR: [{ name }, { email }]
      },
      select: { name: true, email: true }
    });
    if (existingUser) {
      if (existingUser.name === name) {
        res.status(400).json({
          success: false,
          message: "Username already exist"
        });
      } else if (existingUser.email === email) {
        res.status(400).json({
          success: false,
          message: "User emil already exist"
        });
      }
      return;
    }
    const user = yield prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    if (!user) {
      res.status(500).json({
        success: false,
        message: "Error in creating user"
      });
      return;
    }
    const token = import_jsonwebtoken.default.sign(
      {
        email: user.email,
        id: user.id
      },
      process.env.JWT_SECRET || ""
    );
    res.status(200).json({
      success: true,
      message: "user created successfully",
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "some internal error occurred",
      error
    });
  }
});

// src/routes/auth.routes.ts
var import_passport = __toESM(require("passport"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var authRouter = (0, import_express.Router)();
authRouter.post("/signup", registerUser);
authRouter.post(
  "/login",
  import_passport.default.authenticate("local"),
  (req, res) => {
    const user = req.user;
    const token = import_jsonwebtoken2.default.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || ""
    );
    res.status(200).json({
      message: "Login successful",
      user,
      token
    });
  }
);

// src/index.ts
import_dotenv.default.config();
var app = (0, import_express2.default)();
var port = 3e3;
app.use((0, import_express2.json)()).use(
  (0, import_express_session.default)({
    secret: process.env.SESSION_SECRET || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false
    }
  })
).use(import_passport2.default.initialize()).use(import_passport2.default.session());
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
app.use("/api/v1/auth", authRouter);
app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
