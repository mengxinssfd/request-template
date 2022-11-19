import { defineConfig } from 'vitepress';
import { version, homepage } from '../../package.json';

const githubRepo = homepage.replace('#readme', '');
export default defineConfig({
  lang: 'zh-CN',
  title: 'request-template',
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#3c8772' }]],


  markdown: {
    headers: {
      level: [0, 0],
    },
  },

  themeConfig: {
    nav: [
      {
        text: version,
        items: [
          {
            text: 'Changelog',
            link: githubRepo + '/blob/main/CHANGELOG.md',
          },
          {
            text: 'Contributing',
            link: githubRepo + '/blob/main/.github/contributing.md',
          },
        ],
      },
    ],

    sidebar: {
      // '/guide/': sidebarGuide(),
      // '/config/': sidebarConfig()
    },

    editLink: {
      pattern: githubRepo + '/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    socialLinks: [{ icon: 'github', link: githubRepo }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present DYH',
    },

    // 搜索，官方的不是本地搜索，而是用的在线搜索
    // 使用algolia参考：https://segmentfault.com/a/1190000041480102/
    // algolia: {
    // appId: '8J64VVRP8K',
    // apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
    // indexName: 'vitepress',
    // },
  },
});
