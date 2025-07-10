import { ExportButtonProps } from "./types";
import { authenticate } from "./auth";
import { convertToMarkdown } from "./convert";

async function createGoogleDoc(
  access_token: string,
  title: string,
  markdown: string
): Promise<string> {
  const filename = `${title || "Untitled Document"}`;

  const metadata = {
    name: filename,
    mimeType: "application/vnd.google-apps.document",
  };

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const body =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: text/markdown\r\n\r\n" +
    markdown +
    close_delim;

  const upload = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": `multipart/related; boundary="${boundary}"`,
      },
      body: body,
    }
  );

  const result = await upload.json();

  return result.id;
}

export async function exportToGoogleDocs(
  ctx: ExportButtonProps["ctx"],
  record: { title: string; structuredText: any }
) {
  const { title, structuredText } = record;

  const markdown = await convertToMarkdown(structuredText);

  const accessToken = await authenticate(ctx);

  if (!accessToken) {
    ctx.alert("Authentication failed");
    return;
  }

  const documentId = await createGoogleDoc(accessToken, title, markdown || "");

  const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  window.open(docUrl, "_blank");
}
