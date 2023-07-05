const jsxLoader = require("./jsxLoader");
const jsxUcTransform = require("./helpers/jsxUcTransform");

module.exports = async (src) => {
  src = await jsxLoader(src);
  return jsxUcTransform(src);
};
