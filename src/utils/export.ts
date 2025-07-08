import { render } from "datocms-structured-text-to-html-string";
import { ExportButtonProps } from "./types";
import { authenticate } from "./auth";

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

async function createGoogleDoc(
  access_token: string,
  title: string
): Promise<string> {
  const response = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    body: JSON.stringify({
      title: title || "Untitled Document",
    }),
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  const { documentId } = await response.json();

  return documentId;
}

async function updateGoogleDoc(
  access_token: string,
  documentId: string,
  html: string
) {
  return await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: html,
            },
          },
        ],
      }),
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function exportToGoogleDocs(
  ctx: ExportButtonProps["ctx"],
  record: any
) {
  const title = record.title;
  const html = convertToHTML(record.content);

  const accessToken = await authenticate(ctx);

  if (!accessToken) {
    ctx.alert("Authentication failed");
    return;
  }

  const documentId = await createGoogleDoc(accessToken, title);

  await updateGoogleDoc(accessToken, documentId, html);

  const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  window.open(docUrl, "_blank");
}
