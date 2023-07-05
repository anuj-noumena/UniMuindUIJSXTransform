const jsxPropsTransform = require("../jsxPropsTransform");
const Babel = require("@babel/core");

module.exports = (src) => {
  return Babel.transformSync(src, {
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
    ],
  }).code;
};
