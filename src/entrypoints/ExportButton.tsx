import { Canvas, Button } from "datocms-react-ui";
import { useCallback, useState } from "react";
import { ExportButtonProps } from "../utils/types";
import { exportToGoogleDocs } from "../utils/export";
import { getRecordMetadata } from "../utils/convert";

export function ExportButton({ ctx }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const record = getRecordMetadata(ctx);

  const handleExport = useCallback(async () => {
    setIsLoading(true);

    try {
      await exportToGoogleDocs(ctx, record);
      ctx.notice("Google Doc created successfully!");
    } catch (error) {
      ctx.alert(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [ctx, record]);

  return (
    <Canvas ctx={ctx}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          buttonType="primary"
          onClick={handleExport}
          disabled={isLoading}
        >
          {isLoading ? "Exporting..." : "Export to Google Docs"}
        </Button>
      </div>
    </Canvas>
  );
}
