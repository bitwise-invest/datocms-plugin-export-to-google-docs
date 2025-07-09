import {
  RenderConfigScreenCtx,
  RenderItemFormSidebarPanelCtx,
} from "datocms-plugin-sdk";

export type PluginParameters = {
  client_id: string;
  access_token: string;
  expires_at: number;
};

export type ConfigScreenProps = {
  ctx: RenderConfigScreenCtx;
};

export type ExportButtonProps = {
  ctx: RenderItemFormSidebarPanelCtx;
  sidebarPaneId: string;
};
