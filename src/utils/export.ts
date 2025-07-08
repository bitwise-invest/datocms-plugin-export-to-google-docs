import { ExportButtonProps } from "./types";
import { authenticate } from "./auth";
import { convertToMarkdown } from "./convert";

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
  text: string
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
              text: text,
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
  const markdown = await convertToMarkdown(record.content);

  const accessToken = await authenticate(ctx);

  if (!accessToken) {
    ctx.alert("Authentication failed");
    return;
  }

  const documentId = await createGoogleDoc(accessToken, title);

  await updateGoogleDoc(accessToken, documentId, markdown || "");

  const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  window.open(docUrl, "_blank");
}
