module.exports = {
  title: 'LunaTechsDev',
  description: 'Just playing around',
  themeConfig: {
    search: false,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'Support', items: [
        { text: 'F.A.Q', link: '/faq' },
        { text: 'Terms', link: '/terms-of-use' }
      ]},
      { text: 'GitHub', link: 'https://github.com/LunaTechsDev' }
    ]
  }
}