// module.exports.routeMap = {
//   vi: {
//     index: '/',
//     login: '/dang-nhap',
//     register: '/dang-ky',
//     about: '/gioi-thieu',
//     shipplan: '/ke-hoach-tau'
//   },
//   en: {
//     index: '/en',
//     login: '/en/login',
//     register: '/en/register',
//     about: '/en/about',
//     shipplan: '/en/shipplan'
//   }
// };


module.exports.routeMap = [
  {
    key: 'index',
    paths: {
      vi: '/',
      en: '/en'
    }
  },
  {
    key: 'login',
    paths: {
      vi: '/dang-nhap',
      en: '/en/login'
    }
  },
  {
    key: 'about',
    paths: {
      vi: '/gioi-thieu',
      en: '/en/about'
    },
    children: [
      {
        key: 'company',
        paths: {
          vi: '/gioi-thieu/cong-ty',
          en: '/en/about/company'
        }
      }
    ]
  },
  {
    key: 'shipplan',
    paths: {
      vi: '/ke-hoach-tau',
      en: '/en/shipplan'
    },
    children: [
      {
        key: 'detail',
        paths: {
          vi: '/ke-hoach-tau/chi-tiet',
          en: '/en/shipplan/detail'
        }
      }
    ]
  },
  {
    key: 'register',
    paths: {
      vi: '/dang-ky',
      en: '/en/register'
    },
    children: [
     
    ]
  }
];
