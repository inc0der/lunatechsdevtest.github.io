const resolve = require('vuepress-theme-hope/resolve')

module.exports = resolve({
  title: 'LunaTechsDev',
  description: 'Just playing around',
  baseLang: 'en-US',
  head: [
    ['script', { src: 'https://hcaptcha.com/1/api.js'}, 'async defer']
  ],
  locales: {
    '/': {
      lang: 'en-US',
      themeColor: 'Accent Color',
      themeMode: 'Mode'
    }
  },
  themeConfig: {
    author: 'LunaTechs Contributors',
    repo: 'https://github.com/LunaTechsDev',
    fullscreen: false,
    pageInfo: false,
    editLinks: false,
    lastUpdated: false,
    footer: {
      display: true
    },
    search: false,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'Support', items: [
        { text: 'F.A.Q', link: '/faq' },
        { text: 'Terms', link: '/terms-of-use' }
      ]}
    ]
  }
})