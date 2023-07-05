const jsxLoader = require("../src/jsxLoader");
const jsxUcTransform = require("../src/helpers/jsxUcTransform");

const fs = require("fs");
const path = require("path");
describe("JSX Loader test", () => {
  before(() => {});

  after(() => {
    content = null;
  });

  it("Basic content test", (done) => {
    const content = fs.readFileSync(path.resolve("./test/template/contentid.html"), "utf8");
    jsxLoader(content).then((out) => {
      console.log(out);
      out = jsxUcTransform(out);
      console.log(out);
      done();
    });
  }).timeout(10000);
});
