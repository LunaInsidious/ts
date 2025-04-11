const babel = require("@babel/core");

const { code } = babel.transformSync(
  'const element = <div id="test"><h1>Hello</h1></div>',
  {
    presets: ["@babel/preset-env"],
    plugins: [["@babel/plugin-transform-react-jsx"]],
  },
);

console.log(code);
