"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = void 0;
var _jsxLoader = _interopRequireDefault(require("./jsxLoader"));
var _jsxPropsTransform = _interopRequireDefault(require("./jsxPropsTransform"));
var Babel = _interopRequireWildcard(require("@babel/core"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const compile = src => {
  src = (0, _jsxLoader.default)(src);
  var output = Babel.transform(src, {
    presets: [["@babel/preset-env", {
      targets: {
        chrome: "60"
      },
      loose: true,
      modules: false
    }]],
    plugins: [["@babel/plugin-proposal-class-properties", {
      loose: true
    }], ["@babel/plugin-transform-react-jsx", {
      pragma: "jsx",
      pragmaFrag: "Fragment"
    }], [_jsxPropsTransform.default]
    //["./node_modules/uniminduijsxtransform/jsxPropsTransform.js"]
    ]
  }).code;
  return output;
};
exports.compile = compile;

