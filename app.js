const express = require("express");
const nunjucks = require("nunjucks");
const { Sequelize } = require("sequelize");
const webRoutes = require("./routes");
const cookieParser = require('cookie-parser');
const { routeMap } = require("./config/routes");
const axios = require('axios');
const fs = require("fs");
const path = require("path");
const useragent = require('useragent');
const { resolveUrlHandler } = require('./utils/url/resolveUrl.js');
const { getModulesLanguages } = require("./utils/moduleScanner");
const authenticateToken = require("./middlewares/authenticateToken");
const authorizeRoles = require('./middlewares/authorizeRoles');

require("dotenv").config();
const { registerNunjucksGlobals } = require("./services/nunjucksHelpers");
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));


app.get('/', (req, res) => {
  res.render('index', { title: 'Trang chủ', message: 'Chào mừng đến với trang web của bạn!' });
});


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: true,
  },
});

sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database error:", err));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
