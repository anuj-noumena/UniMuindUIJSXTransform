const jsxLoader = require("./jsxLoader");
const jsxPropsTransform = require("./jsxPropsTransform");
const Babel = require("@babel/core");

module.exports = async (src) => {
  src = await jsxLoader(src);
  var output = Babel.transform(src, {
    presets: [["@babel/preset-env", { targets: { chrome: "60" }, loose: true, modules: false }]],
    plugins: [
      [
        "@babel/plugin-proposal-class-properties",
        {
          loose: true,
        },
      ],
      [
        "@babel/plugin-transform-react-jsx",
        {
          pragma: "jsx",
          pragmaFrag: "Fragment",
        },
      ],
      [jsxPropsTransform],
      //["./node_modules/uniminduijsxtransform/jsxPropsTransform.js"]
    ],
  }).code;

  return output;
};
