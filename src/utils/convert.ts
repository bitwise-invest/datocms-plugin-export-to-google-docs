import { render } from "datocms-structured-text-to-html-string";

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

export function convertToHTML(content: any): string {
  const structuredText: any = {
    schema: "dast",
    document: {
      type: "root",
      children: convertToDAST(content),
    },
  };

  return render(structuredText) as string;
}
