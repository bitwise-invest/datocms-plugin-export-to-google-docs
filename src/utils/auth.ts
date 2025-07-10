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
              expires_in?: number;
            }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export enum GoogleAuthStorageKey {
  AccessToken = "google_access_token",
  ExpiresAt = "google_expires_at",
}

export async function authenticate(
  ctx: ExportButtonProps["ctx"]
): Promise<string | null> {
  const parameters = ctx.plugin.attributes.parameters as PluginParameters;

  if (!parameters.client_id) {
    ctx.alert("Google Client ID not configured");
    return null;
  }

  const stored_access_token = localStorage.getItem(
    GoogleAuthStorageKey.AccessToken
  );
  const stored_expires_at = localStorage.getItem(
    GoogleAuthStorageKey.ExpiresAt
  );

  if (
    stored_access_token &&
    stored_expires_at &&
    parseInt(stored_expires_at) > Date.now()
  ) {
    return stored_access_token;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";

    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          "Authentication timed out. Popup may have been closed. Please try again."
        )
      );
    }, 15 * 1000); // 15 seconds timeout

    script.onload = () => {
      if (window.google) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: parameters.client_id,
          scope:
            "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents",
          callback: (response: any) => {
            clearTimeout(timeoutId);
            if (response.access_token) {
              localStorage.setItem(
                GoogleAuthStorageKey.AccessToken,
                response.access_token
              );
              localStorage.setItem(
                "google_expires_at",
                (Date.now() + response.expires_in * 1000).toString()
              );

              ctx.notice("Authentication successful");
              resolve(response.access_token);
            } else {
              reject(new Error("Authentication failed"));
            }
          },
        });

        tokenClient.requestAccessToken();
      } else {
        clearTimeout(timeoutId);
        reject(new Error("Google SDK not loaded"));
      }
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Failed to load Google SDK"));
    };
    document.head.appendChild(script);
  });
}
