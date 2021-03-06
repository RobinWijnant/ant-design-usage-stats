const path = require("path");
const codeAnalyser = require("./codeAnalyser");
const config = require("../config");

test("extractComponents", () => {
  const fileContent = `(<AutoComplete
      className={"search-box-sub"} 
    >
      <Input
        className='soco-preview-search'
        size="large"
        onPressEnter={() => {
          t.props.history.push('/search/result?query=' + t.state.search_value);
          t.handleQuickSearch(t.state.search_value, "search_bar")
        }}
      />
    </AutoComplete>);`;
  const expectedComponentsJson = [
    { type: "AutoComplete", props: { className: "search-box-sub" } },
    {
      type: "Input",
      props: {
        className: "soco-preview-search",
        size: "large",
        onPressEnter: expect.any(Function),
      },
    },
  ];
  const componentsJson = codeAnalyser.extractComponents(fileContent, config.components);
  expect(componentsJson).toStrictEqual(expectedComponentsJson);
});

// test("analyse", async () => {
//   const mockFiles = path.join(__dirname, "mock");
//   const report = await codeAnalyser.analyse(mockFiles, config.components);
//   expect(report).toStrictEqual({});
// });
