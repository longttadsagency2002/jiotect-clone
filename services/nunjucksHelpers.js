const { routeMap } = require('../config/routes');

function registerNunjucksGlobals(env) {
    env.addGlobal('i18nUrl', (key, lang) => {
        const route = routeMap.find(r => r.key === key);
        if (!route) return '#';
        const url = route.paths[lang];
        return url || '#';
      });
}

module.exports = { registerNunjucksGlobals };
