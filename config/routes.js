module.exports.routeMap = [
  {
    key: 'index',
    paths: {
      vi: '/',
      en: '/en'
    },
    controller: 'IndexController',
    action: 'index',
  },
  {
    key: 'login',
    paths: {
      vi: '/dang-nhap',
      en: '/en/login'
    },
    controller: 'AuthController',
    action: 'login',
  },
  {
    key: 'about',
    controller: 'AboutController',
    action: 'index',
    paths: {
      vi: '/gioi-thieu',
      en: '/en/about'
    },
    children: [
      {
        key: 'company',
        controller: 'AboutController',
        action: 'company',
        paths: {
          vi: '/gioi-thieu/cong-ty',
          en: '/en/about/company'
        }
      }
    ]
  },
  {
    key: 'shipplan',
    controller: '',
    action: 'index',
    paths: {
      vi: '/ke-hoach-tau',
      en: '/en/shipplan'
    },
    children: [
      {
        key: 'detail',
        controller: '',
        action: 'detail',
        paths: {
          vi: '/ke-hoach-tau/chi-tiet',
          en: '/en/shipplan/detail'
        }
      }
    ]
  },
  {
    key: 'register',
    controller: 'AuthController',
    action: 'register',
    paths: {
      vi: '/dang-ky',
      en: '/en/register'
    },
    children: [
     
    ]
  },
  {
    key: "chat",
    paths: {
      vi: "/tin-nhan",
      en: "/en/chat"
    },
    controller: "",
    action: "index",
    dir:"modules"
  }
];
