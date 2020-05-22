const codeAnalyser = require("./codeAnalyser");

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
  const extractedComponents = [
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
  expect(codeAnalyser.extractComponents(["AutoComplete", "Input"], fileContent)).toStrictEqual(
    extractedComponents
  );
});
