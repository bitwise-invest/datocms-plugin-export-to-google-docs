import { Canvas, FieldGroup, Form, TextField, Button } from "datocms-react-ui";
import { ConfigScreenProps, PluginParameters } from "../utils/types";
import { useState } from "react";

export default function ConfigScreen({ ctx }: ConfigScreenProps) {
  const parameters = ctx.plugin.attributes.parameters as PluginParameters;
  const [clientId, setClientId] = useState(parameters.client_id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ctx.updatePluginParameters({
      client_id: clientId,
    });
    ctx.notice("Client ID successfully saved");
  };

  const isDisabled = !clientId || clientId === (parameters.client_id || "");

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

      <Form onSubmit={handleSubmit}>
        <FieldGroup>
          <TextField
            required
            name="client_id"
            id="client_id"
            label="Google OAuth 2.0 Client ID"
            placeholder="Enter client_id"
            hint="Provide the Client ID credential from your Google Cloud Platform project"
            value={clientId}
            onChange={(value) => setClientId(value)}
          />
        </FieldGroup>
        <Button type="submit" disabled={isDisabled} buttonType="primary">
          Save Changes
        </Button>
      </Form>
    </Canvas>
  );
}
