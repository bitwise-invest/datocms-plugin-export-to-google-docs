import { render, renderRule } from "datocms-structured-text-to-html-string";
import { isCode } from "datocms-structured-text-utils";
import { rehype } from "rehype";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";

function convertToDAST(node: any): any {
  if (Array.isArray(node)) {
    return node.map(convertToDAST);
  }

  if (typeof node === "object" && node !== null) {
    if (node.text !== undefined && !node.type) {
      const marks = [];
      if (node.strong) marks.push("strong");
      if (node.emphasis) marks.push("emphasis");

      return {
        type: "span",
        value: node.text,
        marks: marks,
      };
    }

    const converted = { ...node };
    if (converted.children) {
      converted.children = convertToDAST(converted.children);
    }
    return converted;
  }

  return node;
}

export async function convertToMarkdown(node: any): Promise<string | null> {
  const structuredText: any = {
    schema: "dast",
    document: {
      type: "root",
      children: convertToDAST(node),
    },
  };

  const content = render(structuredText, {
    customRules: [
      renderRule(isCode, ({ adapter: { renderNode, renderText }, key, node }) =>
        renderNode(
          "pre",
          { key, class: `language-${node.language}` },
          renderNode(
            "code",
            { key, class: `language-${node.language}` },
            renderText(node.code)
          )
        )
      ),
    ],
  });

  if (!content) return null;

  const markdown = await rehype()
    .use(rehype2remark)
    .use(stringify)
    .process(content);

  return String(markdown);
}
