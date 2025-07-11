import { Canvas, FieldGroup, Form, TextField } from "datocms-react-ui";
import { ConfigScreenProps, PluginParameters } from "../utils/types";

export default function ConfigScreen({ ctx }: ConfigScreenProps) {
  const parameters = ctx.plugin.attributes.parameters as PluginParameters;

  return (
    <Canvas ctx={ctx}>
      <p style={{ marginTop: "0" }}>
        This plugin allows you to export a record's Structured Text content to a
        Google Doc in your Google Account.
      </p>

      <p>
        To use this plugin, you need to add the OAuth 2.0 Client ID from your
        Google Cloud Platform project.
      </p>

      <Form>
        <FieldGroup>
          <TextField
            required
            name="client_id"
            id="client_id"
            label="Google OAuth 2.0 Client ID"
            placeholder="Enter client_id"
            hint="Provide the Client ID credential from your Google Cloud Platform project"
            value={parameters.client_id || ""}
            onChange={(value) => {
              ctx.updatePluginParameters({
                client_id: value,
              });
              ctx.notice("Client ID successfully saved");
            }}
          />
        </FieldGroup>
      </Form>
    </Canvas>
  );
}
