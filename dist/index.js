"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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

// src/schemas/signUpSchema.ts
var import_zod, signUpSchema, signInSchema;
var init_signUpSchema = __esm({
  "src/schemas/signUpSchema.ts"() {
    "use strict";
    import_zod = require("zod");
    signUpSchema = import_zod.z.object({
      name: import_zod.z.string().min(1, "Name is Required"),
      email: import_zod.z.string().email("Invalid email address"),
      password: import_zod.z.string().min(8, "Password must be at least 8 characters long")
    });
    signInSchema = import_zod.z.object({
      email: import_zod.z.string().email("Invalid email address"),
      password: import_zod.z.string().min(8, "Password must be at least 8 characters long")
    });
  }
});

// src/controllers/authController.ts
var import_bcryptjs, registerUser, login, loginWithGoogle;
var init_authController = __esm({
  "src/controllers/authController.ts"() {
    "use strict";
    init_prismaClient();
    init_signUpSchema();
    import_bcryptjs = __toESM(require("bcryptjs"));
    init_signUpSchema();
    registerUser = (req, res) => __async(void 0, null, function* () {
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
        const hashedPassword = yield import_bcryptjs.default.hash(password, 10);
        const existingUser = yield prisma.user.findFirst({
          where: {
            OR: [{ name }, { email }]
          },
          select: {
            id: true,
            name: true,
            email: true,
            googleId: true,
            password: true
          }
        });
        if (existingUser) {
          if (existingUser.name === name) {
            res.status(400).json({
              success: false,
              message: "Username already exist"
            });
          } else if (existingUser.email === email) {
            if (existingUser.googleId && !existingUser.password) {
              const user2 = yield prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  password: hashedPassword
                }
              });
              res.status(200).json({
                success: true,
                message: "User Updated Successfully",
                id: user2.id.toString(),
                name: user2.name,
                email: user2.email,
                googleId: user2.googleId
              });
              return;
            }
            res.status(400).json({
              success: false,
              message: "User emil already exist"
            });
          }
          return;
        }
        const user = yield prisma.user.create({
          data: { name, email, password: hashedPassword, authType: "CREDENTIALS" }
        });
        if (!user) {
          res.status(500).json({
            success: false,
            message: "Error in creating user"
          });
          return;
        }
        res.status(200).json({
          success: true,
          message: "user created successfully"
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "some internal error occurred",
          error
        });
      }
    });
    login = (email, password, done) => __async(void 0, null, function* () {
      try {
        const parsedData = signInSchema.safeParse({ email, password });
        if (!parsedData.success) {
          const errors = "Validation error " + parsedData.error.errors.map((err) => `${err.path} ${err.message}`);
          return done(null, false, { message: `${errors}` });
        }
        const user = yield prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            authType: true,
            googleId: true
          }
        });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isMatch = yield import_bcryptjs.default.compare(password, user.password || "");
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    });
    loginWithGoogle = (accessToken, refreshToken, profile, done) => __async(void 0, null, function* () {
      var _a, _b;
      try {
        const email = (_b = (_a = profile.emails) == null ? void 0 : _a.find((emailObj) => emailObj.verified)) == null ? void 0 : _b.value;
        if (!email) done(null, false, { message: "No verified email found." });
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        let user;
        if (!existingUser || !existingUser.googleId || existingUser.authType !== "GOOGLE") {
          user = yield prisma.user.upsert({
            where: {
              email
            },
            update: {
              authType: "GOOGLE",
              googleId: profile.id
            },
            create: {
              email,
              name: profile.displayName,
              authType: "GOOGLE",
              googleId: profile.id
            }
          });
        } else user = existingUser;
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
    var import_passport_google_oauth20 = require("passport-google-oauth20");
    init_prismaClient();
    init_authController();
    import_passport4.default.use(
      new import_passport_local.Strategy(
        {
          usernameField: "email",
          passwordField: "password"
        },
        login
      )
    );
    import_passport4.default.use(
      new import_passport_google_oauth20.Strategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          callbackURL: "http://localhost:3000/api/v1/auth/callback"
        },
        loginWithGoogle
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
var import_cors = __toESM(require("cors"));
var import_config = require("dotenv/config");
var import_passport3 = __toESM(require_passport());

// src/routes/auth.routes.ts
var import_express = require("express");
init_authController();
var import_passport = __toESM(require("passport"));
var authRouter = (0, import_express.Router)();
authRouter.post("/signup", registerUser);
authRouter.get(
  "/authGoogle",
  import_passport.default.authenticate("google", { scope: ["profile", "email"] })
);
authRouter.get(
  "/callback",
  import_passport.default.authenticate("google", { failureMessage: "failed" }),
  (req, res) => {
    const _a = req.user, { password } = _a, userData = __objRest(_a, ["password"]);
    res.status(200).json({
      message: "Login successful",
      user: userData
    });
  }
);
authRouter.post("/login", (req, res, next) => {
  import_passport.default.authenticate(
    "local",
    (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "An error occurred", error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: (info == null ? void 0 : info.message) || "Authentication failed" });
      }
      req.login(user, { session: false }, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed", error: loginErr.message });
        }
      });
      const _a = req.user, { password } = _a, userData = __objRest(_a, ["password"]);
      res.status(200).json({
        message: "Login successful",
        userData
      });
    }
  )(req, res, next);
});
authRouter.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err.message });
    }
    req.session.destroy((err2) => {
      if (err2) {
        return res.status(500).json({ message: "Failed to destroy session", error: err2.message });
      }
      res.clearCookie("connect.sid", { path: "/" });
      res.status(200).json({ message: "Logout successful" });
    });
  });
});

// src/index.ts
var app = (0, import_express2.default)();
var port = 3e3;
app.use((0, import_cors.default)()).use((0, import_express2.json)()).use(
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
app.get("/session-info", (req, res) => {
  res.json(req.session);
});
app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
