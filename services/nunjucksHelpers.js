const { routeMap } = require('../config/routes');

function registerNunjucksGlobals(env) {
    env.addGlobal('i18nUrl', (key, lang) => {
        const route = routeMap.find(r => r.key === key);
        if (!route) return '#';
        const url = route.paths[lang];
        return url || '#';
      });

      function flattenRoutes(routes) {
        let list = [];
        for (const r of routes) {
          list.push(r);
          if (r.children && r.children.length > 0) {
            list = list.concat(flattenRoutes(r.children));
          }
        }
        return list;
      }
      
      env.addGlobal('toggleLangUrl', (currentUrl, currentLang) => {
        if (!currentUrl) return '/';
      
        let cleanUrl = currentUrl.split('?')[0];
        if (cleanUrl.length > 1 && cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
      
        if (cleanUrl.startsWith('/en')) {
          cleanUrl = cleanUrl.slice(3) || '/';
        } else if (cleanUrl.startsWith('/vi')) {
          cleanUrl = cleanUrl.slice(3) || '/';
        }
      
        const allRoutes = flattenRoutes(routeMap);
      
        const currentRoute = allRoutes.find(r => {
          let routeUrl = r.paths[currentLang];
          if (routeUrl.length > 1 && routeUrl.endsWith('/')) routeUrl = routeUrl.slice(0, -1);
      
          if (currentLang === 'en' && routeUrl.startsWith('/en')) {
            routeUrl = routeUrl.slice(3) || '/';
          } else if (currentLang === 'vi' && routeUrl.startsWith('/vi')) {
            routeUrl = routeUrl.slice(3) || '/';
          }
      
          return routeUrl === cleanUrl;
        });
      
        if (!currentRoute) {
          if (currentLang === 'en') {
            return '/vi' + cleanUrl;
          } else {
            return '/en' + cleanUrl;
          }
        }
      
        const otherLang = currentLang === 'en' ? 'vi' : 'en';
      
        let otherUrl = currentRoute.paths[otherLang] || '/';
      
        if (otherUrl.length > 1 && otherUrl.endsWith('/')) {
          otherUrl = otherUrl.slice(0, -1);
        }
      
        return otherUrl;
      });
      
      
}



module.exports = { registerNunjucksGlobals };
