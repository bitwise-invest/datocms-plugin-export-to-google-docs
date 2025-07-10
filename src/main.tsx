import { connect } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import { render } from "./utils/render";
import { ExportButton } from "./entrypoints/ExportButton";
import ConfigScreen from "./entrypoints/ConfigScreen";
import { hasStructuredText } from "./utils/convert";

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  itemFormSidebarPanels(itemType, ctx) {
    if (!hasStructuredText(itemType, ctx)) {
      return [];
    }

    return [
      {
        id: "export",
        label: "Export",
      },
    ];
  },
  renderItemFormSidebarPanel(sidebarPaneId, ctx) {
    if (sidebarPaneId === "export2" && ctx.item) {
      return render(<ExportButton ctx={ctx} />);
    }
  },
});
