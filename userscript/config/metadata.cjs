const { author, dependencies, repository, version } = require('../package.json')

module.exports = {
  name: 'osu! Discussions Vote',
  namespace: 'https://rorre.xyz/',
  version: version,
  author: author,
  source: repository.url,
  // 'license': 'MIT',
  match: [
    'https://osu.ppy.sh/*'
  ],
  require: [
    `https://cdn.jsdelivr.net/npm/jquery@${dependencies.jquery}/dist/jquery.min.js`,
    `https://cdn.jsdelivr.net/npm/axios@${dependencies.axios}/dist/axios.min.js`,
    `https://cdn.jsdelivr.net/npm/axios-userscript-adapter@${dependencies['axios-userscript-adapter']}/dist/axiosGmxhrAdapter.min.js`,
  ],
  grant: [
    'GM.xmlHttpRequest'
  ],
  connect: [
    'httpbin.org',
    '127.0.0.1',
    '127.0.0.1:5000'
  ],
  'run-at': 'document-end'
}
