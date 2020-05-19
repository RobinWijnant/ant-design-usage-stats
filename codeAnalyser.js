var fs = require("fs");
var glob = require("glob-promise");

// matches multiple occurrences of "<Component prop='example'" multiline
const createRegex = (components) => new RegExp(`<(${components.join("|")})[^\/>]*`, "gm");

const extractComponentProps = (componentString) => {
  // Matches all props with value except last one
  // "<Component prop='example' last='notInArray" => ["prop='example'"]
  const propsKeyWithValue = componentString.match(/[a-zA-Z]*=[{'"].+?(?=[a-zA-Z\s]*=[{'"])/gm);
  // Matches last prop with value
  // "<Component prop='example' last='notInArray" => "last='notInArray'"
  propsKeyWithValue.push(componentString.match(/(?<==['"}].+?['"}]\s).*['"}]$/));
};

const analyse = async (repoDir, components) => {
  const filePaths = await glob.promise("**/*.{js,jsx,tsx}", { root: repoDir });
  return filePaths.map(async (path) => {
    const content = await fs.promises.readFile(path, { encoding: "utf8" });
    const regex = createRegex(components);
    const matches = content.match(regex);
    console.log(matches);
    Promise.resolve();
  });
};

module.exports = { analyse };
