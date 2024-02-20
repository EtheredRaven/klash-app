const insertMatch = require("../../db/insertMatch");

module.exports = async function (Server, eventArgs) {
  await insertMatch(Server, eventArgs.match);
};
