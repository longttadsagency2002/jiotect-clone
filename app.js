const express = require('express');
const nunjucks = require('nunjucks');
const { Sequelize } = require('sequelize');
const webRoutes = require('./routes');
const { routeMap } = require('./config/routes');
const fs = require('fs');
const path = require('path');
const { getModulesLanguages } = require('./utils/moduleScanner');
require('dotenv').config();const { registerNunjucksGlobals } = require('./services/nunjucksHelpers');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

const viewsPath = path.join(__dirname, 'theme');

const env = nunjucks.configure(viewsPath, {
  autoescape: true,
  express: app,
  noCache: true
});
registerNunjucksGlobals(env);

app.set('view engine', 'njk');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const modulesLanguage = getModulesLanguages( 'modules');

// console.log("modules : ", modules);

let translations = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/en.json'))),
  vi: JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/vi.json')))
};

// console.log("translations : ",translations)
// console.log("modulesLanguage : ", modulesLanguage)

function mergeModulesToTranslations(modulesLanguage, translations) {
  const merged = JSON.parse(JSON.stringify(translations));

  ['en', 'vi'].forEach(lang => {
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
          ...content
        };
      }
    }
  });

  return merged;
}


translations = mergeModulesToTranslations(modulesLanguage, translations);
// console.log("translations : ", translations);

async function callControllerAction(req, res, lang, t, moduleName, controllerName, actionName) {
  try {
    const controllerPath = path.join(__dirname, 'modules', moduleName, 'controllers', controllerName);
    const controller = require(controllerPath);

    if (controller && typeof controller[actionName] === 'function') {
      const result = await controller[actionName](req, res, lang, t);
      return result;
    } else {
      throw new Error(`Action ${actionName} không tồn tại trong ${controllerName}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function registerRoutes(routeList, lang) {
  const t = translations[lang];

  routeList.forEach(route => {
    const url = route.paths[lang];
    const key = route.key;
    const contentView = `views/${key}/index.njk`;
    const absolutePath = path.join(__dirname, 'theme', contentView);


    // Đường dẫn có prefix (ví dụ /vi/dang-nhap)
    const prefixUrl = lang === 'vi' ? `/vi${url === '/' ? '' : url}` : url;
 
    // Route gốc
    app.get(url, async (req, res) => {
      let moduleName = key;
      let controllerName = route.controller;
      let actionName = route.action;

      let result;
      let resultChild;
      if (moduleName && controllerName && actionName) {
        result = await callControllerAction(req, res, lang, t, moduleName, controllerName, actionName);
      } 

      if (fs.existsSync(absolutePath)) {
        const currentUrl = req.originalUrl;
        const layout = (key === 'login' || key === 'register') ? 'auth' : 'index';
        res.render(layout, { lang, t, contentView, key, currentUrl,data: result });
      } else {
        res.status(404).render("404", { lang, t });
      }
    });

    if (lang === 'vi') {
      app.get(prefixUrl, (req, res) => {
        const currentUrl = req.originalUrl;
        if (fs.existsSync(absolutePath)) {
          const layout = (key === 'login' || key === 'register') ? 'auth' : 'index';
          res.render(layout, { lang, t, contentView, key, currentUrl, data: result });
        } else {
          res.status(404).render("404", { lang, t });
        }
      });
    }

    if (route.children && route.children.length > 0) {
      route.children.forEach(child => {
        const childUrl = child.paths[lang];
        const childKey = child.key;
        const childView = `views/${key}/${childKey}/index.njk`;
        const childPath = path.join(__dirname, 'theme', childView);

        if( child.controller && child.action && child.moduleName)  {
          resultChild = callControllerAction(req, res, lang, t, child.moduleName, child.controller, child.action);
        }

        app.get(childUrl, (req, res) => {
          if (fs.existsSync(childPath)) {
            res.render("index", { lang, t, contentView: childView, key: childKey, currentUrl, data: resultChild });
          } else {
            res.status(404).render("404", { lang, t });
          }
        });

        if (lang === 'vi') {
          const childPrefixUrl = `/vi${childUrl === '/' ? '' : childUrl}`;
          app.get(childPrefixUrl, (req, res) => { 
            const currentUrl = req.originalUrl;
            if (fs.existsSync(childPath)) {
              res.render("index", { lang, t, contentView: childView, key: childKey, currentUrl, data: resultChild });
            } else {
              res.status(404).render("404", { lang, t });
            }
          });
        }
      });
    }
  });
}


registerRoutes(routeMap, 'vi');
registerRoutes(routeMap, 'en');


app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  const lang = req.path.startsWith('/en') ? 'en' : 'vi';
  const t = lang === 'en' ? translations.en : translations.vi;
  res.status(404).render('404', { lang, t });
});


app.use('/', webRoutes);

// Connect DB
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database error:', err));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
