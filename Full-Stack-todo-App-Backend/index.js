const express = require("express");
const dbConnection = require("./config/dbConnection");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerOptions");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const router = require("./router/router");
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://full-stack-todo-with-role-based-and.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", router);

dbConnection();

// Run locally if not in Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server started at Port ${PORT}`);
  });
}

module.exports = app;
