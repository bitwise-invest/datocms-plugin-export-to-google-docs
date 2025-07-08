import { Canvas, Button } from "datocms-react-ui";
import { useCallback } from "react";
import { authenticate } from "../utils/auth";
import { ExportButtonProps } from "../utils/types";
import { convertToHTML } from "../utils/convert";

export function ExportButton({ ctx }: ExportButtonProps) {
  const record = ctx.formValues;

  const handleExport = useCallback(async () => {
    const title = record.title;
    const html = convertToHTML(record.content);

    const accessToken = await authenticate(ctx);

    console.log(title, html, accessToken);
  }, [ctx.formValues]);

  return (
    <Canvas ctx={ctx}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button buttonType="primary" onClick={handleExport}>
          Export to Google Docs
        </Button>
      </div>
    </Canvas>
  );
}
