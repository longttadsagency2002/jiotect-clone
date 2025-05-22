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
const modulesLanguage = getModulesLanguages("modules");
const moduleNames = Object.keys(modulesLanguage);
moduleNames.forEach(mod => {
  app.use(`/modules/${mod}/web`, express.static(`modules/${mod}/web`));
});

const viewsPaths = [
  path.join(__dirname, "theme"),
  path.join(__dirname, "modules"),
];

const env = nunjucks.configure(viewsPaths, {
  autoescape: true,
  express: app,
  noCache: true,
});

registerNunjucksGlobals(env);

app.set("view engine", "njk");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// const modulesLanguage = getModulesLanguages("modules");

// console.log("modules : ", modules);

let translations = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, "languages/en.json"))),
  vi: JSON.parse(fs.readFileSync(path.join(__dirname, "languages/vi.json"))),
};

// console.log("translations : ",translations)
// console.log("modulesLanguage : ", modulesLanguage)

function mergeModulesToTranslations(modulesLanguage, translations) {
  const merged = JSON.parse(JSON.stringify(translations));

  ["en", "vi"].forEach((lang) => {
    if (!merged[lang]) merged[lang] = {};

    for (const moduleKey in modulesLanguage) {
      const langData = modulesLanguage[moduleKey]?.[lang];
      if (langData && Object.keys(langData).length > 0) {
        const innerKey = Object.keys(langData)[0];
        const content = langData[innerKey];

        if (!merged[lang][moduleKey]) {
          merged[lang][moduleKey] = {};
        }

        merged[lang][moduleKey] = {
          ...merged[lang][moduleKey],
          ...content,
        };
      }
    }
  });

  return merged;
}

translations = mergeModulesToTranslations(modulesLanguage, translations);
// console.log("translations : ", translations);

async function callControllerAction(
  req,
  res,
  lang,
  t,
  moduleName,
  controllerName,
  actionName
) {
  try {
    const controllerPath = path.join(
      __dirname,
      "modules",
      moduleName,
      "controllers",
      controllerName
    );
    const controller = require(controllerPath);

    if (controller && typeof controller[actionName] === "function") {
      const result = await controller[actionName](req, res, lang, t);
      return result;
    } else {
      throw new Error(
        `Action ${actionName} không tồn tại trong ${controllerName}`
      );
    }
  } catch (error) {
    console.error("Lôĩ xảy ra khi gọi action:", error);
    // console.warn(error);
    throw error;
  }
}

app.get('/resolve-url',resolveUrlHandler);


function registerRoutes(routeList, lang) {
  const t = translations[lang];

  routeList.forEach((route) => {
    const url = route.paths[lang];
    const key = route.key;
    let isDir = route.dir ? true : false;
    const contentView = `views/${key}/index.njk`;
    const absolutePath = path.join(__dirname, "theme", contentView);

    let moduleFrontEndViewPath = path.join(
      __dirname,
      `modules`,
      key,
      "views/front-end",
      `index.njk`
    );
    // console.log("route.key : ", route.key);
    // console.log("absolutePath : ", absolutePath);
    // console.log("moduleFrontEndViewPath : ", moduleFrontEndViewPath);

    // console.log("-----------", fs.existsSync(moduleFrontEndViewPath));

    // Đường dẫn có prefix (ví dụ /vi/dang-nhap)
    const prefixUrl = lang === "vi" ? `/vi${url === "/" ? "" : url}` : url;

    // Hàm xử lý chung cho route chính và prefix
    async function handleRequest(req, res) {
      let moduleName = key;
      let controllerName = route.controller;
      let actionName = route.action;

      let result;
      try {
        if (moduleName && controllerName && actionName) {
          result = await callControllerAction(
            req,
            res,
            lang,
            t,
            moduleName,
            controllerName,
            actionName
          );
        }
      } catch (error) {
        // console.error(error);
        return res.status(500).send("Internal Server Error");
      }

      if (
        fs.existsSync(absolutePath) ||
        (isDir && fs.existsSync(moduleFrontEndViewPath))
      ) {
        const currentUrl = req.originalUrl;
        const layout = key === "login" || key === "register" ? "auth" : "index";
        if (isDir) {
          res.render(layout, {
            lang,
            t,
            contentView: moduleFrontEndViewPath,
            key,
            currentUrl,
            data: result,
          });
        } else {
          res.render(layout, {
            lang,
            t,
            contentView,
            key,
            currentUrl,
            data: result,
          });
        }
      } else {
        res.status(404).render("404", { lang, t });
      }
    }

    // Đăng ký route chính
    app.get(url, handleRequest);

    // Nếu là tiếng Việt, đăng ký thêm route có prefix /vi
    if (lang === "vi" && prefixUrl !== url) {
      app.get(prefixUrl, handleRequest);
    }

    // Xử lý route con (children)
    if (route.children && route.children.length > 0) {
      route.children.forEach((child) => {
        const childUrl = child.paths[lang];
        const childKey = child.key;
        const childView = `views/${key}/${childKey}/index.njk`;
        const childPath = path.join(__dirname, "theme", childView);
        const childPrefixUrl =
          lang === "vi" ? `/vi${childUrl === "/" ? "" : childUrl}` : childUrl;

        async function handleChildRequest(req, res) {
          let resultChild;
          try {
            if (child.moduleName && child.controller && child.action) {
              resultChild = await callControllerAction(
                req,
                res,
                lang,
                t,
                child.moduleName,
                child.controller,
                child.action
              );
            }
          } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
          }

          if (fs.existsSync(childPath)) {
            const currentUrl = req.originalUrl;
            res.render("index", {
              lang,
              t,
              contentView: childView,
              key: childKey,
              currentUrl,
              data: resultChild,
            });
          } else {
            res.status(404).render("404", { lang, t });
          }
        }

        app.get(childUrl, handleChildRequest);

        if (lang === "vi" && childPrefixUrl !== childUrl) {
          app.get(childPrefixUrl, handleChildRequest);
        }
      });
    }
  });
}

registerRoutes(routeMap, "vi");
registerRoutes(routeMap, "en");

app.post('/login-test', (req, res) => {
  const user = {
    id: 1,
    username: 'admin',
    role: 'admin'
  };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 60 * 1000 
  });
  res.json({
    message: 'Đăng nhập thành công!',
    token 
  });
});


app.get('/cms', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.render("admin",)
});

app.get("/test", (req, res) => {
  res.render("index", {
    lang: "en",
    t: translations.en,
    contentView: "chat/views/front-end/index.njk",
    key: "test",
  });
});

app.use((req, res, next) => {
 // Lấy IP (đã setup trust proxy nếu cần)
 const ip = req.ip || req.connection.remoteAddress;

 // Lấy chuỗi user-agent
 const uaString = req.headers['user-agent'] || '';

 // Phân tích user-agent
 const agent = useragent.parse(uaString);

 // Lấy các thông tin chi tiết
 const browser = agent.toAgent();          // ví dụ: "Chrome 115.0.0"
 const os = agent.os.toString();            // ví dụ: "Windows 10"
 const device = agent.device.toString();    // ví dụ: "Other 0.0.0"

 // Log ra console (hoặc thay bằng lưu DB)
 console.log('--- Client Info ---');
 console.log('IP:', ip);
 console.log('Browser:', browser);
 console.log('OS:', os);
 console.log('Device:', device);
 console.log('User-Agent:', uaString);
 console.log('-------------------');
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const lang = req.path.startsWith("/en") ? "en" : "vi";
  const t = lang === "en" ? translations.en : translations.vi;
  res.status(404).render("404", { lang, t });
});


app.use("/", webRoutes);

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
