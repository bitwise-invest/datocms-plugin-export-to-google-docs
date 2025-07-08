import { ExportButtonProps, PluginParameters } from "./types";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
            }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export async function authenticate(
  ctx: ExportButtonProps["ctx"]
): Promise<string | null> {
  const parameters = ctx.plugin.attributes.parameters as PluginParameters;

  if (!parameters.client_id) {
    ctx.alert("Google Client ID not configured");
    return null;
  }

  if (parameters.access_token) {
    return parameters.access_token;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      if (window.google) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: parameters.client_id,
          scope:
            "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents",
          callback: (response: any) => {
            if (response.access_token) {
              ctx.updatePluginParameters({
                client_id: parameters.client_id,
                access_token: response.access_token,
              });
              ctx.notice("Authentication successful!");
              resolve(response.access_token);
            } else {
              ctx.alert("Failed to get access token");
              reject(new Error("Authentication failed"));
            }
          },
        });

        tokenClient.requestAccessToken();
      } else {
        reject(new Error("Google SDK not loaded"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

export async function callGoogleAPI(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const response = await fetch(`https://docs.googleapis.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Google API call failed: ${response.statusText}`);
  }

  return response.json();
}
