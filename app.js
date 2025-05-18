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

const modules = getModulesLanguages( 'modules');
// console.log('modules:', JSON.stringify(modules, null, 2));

// console.log("modules : ", modules);

const translations = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/en.json'))),
  vi: JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/vi.json')))
};

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
    app.get(url, (req, res) => {
      if (fs.existsSync(absolutePath)) {
        const layout = (key === 'login' || key === 'register') ? 'auth' : 'index';
        res.render(layout, { lang, t, contentView, key });
      } else {
        res.status(404).render("404", { lang, t });
      }
    });

    // Nếu là tiếng Việt thì đăng ký thêm route có /vi prefix
    if (lang === 'vi') {
      app.get(prefixUrl, (req, res) => {
        if (fs.existsSync(absolutePath)) {
          const layout = (key === 'login' || key === 'register') ? 'auth' : 'index';
          res.render(layout, { lang, t, contentView, key });
        } else {
          res.status(404).render("404", { lang, t });
        }
      });
    }

    // Xử lý children như cũ, bạn cũng có thể đăng ký cả 2 dạng tương tự nếu muốn
    if (route.children && route.children.length > 0) {
      route.children.forEach(child => {
        const childUrl = child.paths[lang];
        const childKey = child.key;
        const childView = `views/${key}/${childKey}/index.njk`;
        const childPath = path.join(__dirname, 'theme', childView);

        // Không có prefix
        app.get(childUrl, (req, res) => {
          if (fs.existsSync(childPath)) {
            res.render("index", { lang, t, contentView: childView, key: childKey });
          } else {
            res.status(404).render("404", { lang, t });
          }
        });

        // Nếu là tiếng Việt, đăng ký thêm có prefix /vi
        if (lang === 'vi') {
          const childPrefixUrl = `/vi${childUrl === '/' ? '' : childUrl}`;
          app.get(childPrefixUrl, (req, res) => {
            if (fs.existsSync(childPath)) {
              res.render("index", { lang, t, contentView: childView, key: childKey });
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
