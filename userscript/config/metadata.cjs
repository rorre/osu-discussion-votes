const {
  author,
  dependencies,
  repository,
  version,
} = require("../package.json");

module.exports = {
  name: "osu! Discussions Vote",
  namespace: "https://rorre.xyz/",
  version: version,
  author: author,
  source: repository.url,
  // 'license': 'MIT',
  match: ["https://osu.ppy.sh/*", "https://votes.rorre.xyz/*"],
  require: [
    `https://cdn.jsdelivr.net/npm/jquery@${dependencies.jquery}/dist/jquery.min.js`,
    `https://cdn.jsdelivr.net/npm/axios@${dependencies.axios}/dist/axios.min.js`,
    `https://cdn.jsdelivr.net/npm/axios-userscript-adapter@${dependencies["axios-userscript-adapter"]}/dist/axiosGmxhrAdapter.min.js`,
  ],
  grant: ["GM.xmlHttpRequest", "GM.setValue", "GM.getValue", "GM.openInTab"],
  connect: ["votes.rorre.xyz"],
  "run-at": "document-end",
};
