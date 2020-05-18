var fs = require("fs");
var glob = require("glob-promise");

const createRegex = (components) => new RegExp(`<(${components.join('|')}).*>`, "gm")
// <(S.ListItemContainer)[\s\S]*?(?=\n.*?|$)

const analyse = async (repoDir, components) => {
  const filePaths = await glob.promise("**/*.{js,jsx,tsx}", { root: repoDir });
  filePaths.map((path) => {
    const content = await fs.promises.readFile(path, { encoding: "utf8" });
    const regex = createRegex(components);
    const matches = content.match(regex);
    
  });
};

module.exports = { analyse };
