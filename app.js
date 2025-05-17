const express = require('express');
const nunjucks = require('nunjucks');
const { Sequelize } = require('sequelize');
const webRoutes = require('./routes');
const { routeMap } = require('./config/routes');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

const viewsPath = path.join(__dirname, 'theme');

nunjucks.configure(viewsPath, {
  autoescape: true,
  express: app,
  noCache: true
});
app.set('view engine', 'njk');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const translations = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/en.json'))),
  vi: JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/vi.json')))
};


Object.entries(routeMap.vi).forEach(([key, routePath]) => {
  let contentView =`views/${key}/index.njk`;
  const absolutePath = path.join(__dirname, 'theme', contentView);
  app.get(routePath, (req, res) => {
    if (fs.existsSync(absolutePath)) {
      if(key === 'login' || key === 'register'){
        res.render("auth", { lang: 'vi', t: translations.vi, contentView: contentView, key: key });
      }else{
        res.render("index", { lang: 'vi', t: translations.vi, contentView: contentView, key: key });
      }
    } else {
      res.render("404", { lang: 'vi', t: translations.vi, contentView: contentView, key: key });
    }
  });
  app.get(`/vi${routePath === '/' ? '' : routePath}`, (req, res) => {
    if (fs.existsSync(absolutePath)) {
      if(key === 'login' || key === 'register'){
        res.render("auth", { lang: 'vi', t: translations.vi, contentView: contentView, key: key });
      }else{
        res.render("index", { lang: 'vi', t: translations.vi, contentView: contentView, key: key });
      }
    } else {
      res.render("404", { lang: 'vi', t: translations.vi, contentView: contentView, key: key });
    }
  });
});

Object.entries(routeMap.en).forEach(([key, routePath]) => {
  let contentView =`views/${key}/index.njk`;
  const absolutePath = path.join(__dirname, 'theme', contentView);
  console.log(contentView);
  app.get(routePath, (req, res) => {
    if (fs.existsSync(absolutePath)) {
      if(key === 'login' || key === 'register'){
        res.render("auth", { lang: 'en', t: translations.en, contentView: contentView, key: key });
      }else{
        res.render("index", { lang: 'en', t: translations.en, contentView: contentView, key: key });
      }
    } else {
      res.render("404", { lang: 'en', t: translations.en, contentView: contentView, key: key });
    }
  });
});

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
