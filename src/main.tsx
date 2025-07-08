import { connect } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import { render } from "./utils/render";
import { ExportButton } from "./entrypoints/ExportButton";
import ConfigScreen from "./entrypoints/ConfigScreen";

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  itemFormSidebarPanels() {
    return [
      {
        id: "export",
        label: "Export",
      },
    ];
  },
  renderItemFormSidebarPanel(sidebarPaneId, ctx) {
    return render(<ExportButton ctx={ctx} />);
  },
});
