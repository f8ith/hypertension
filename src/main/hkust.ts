import { createHash, randomBytes } from "node:crypto";

import { UST_PROTOCOL, UST_CLIENT_ID, OAUTH_BASE } from "@/constants";

export const constructUSTOAuth = () => {
  const codeVerifier = randomBytes(64).toString("hex");
  const nonce = randomBytes(12).toString("hex");
  const newParams = new URLSearchParams([
    ["redirect_uri", UST_PROTOCOL],
    ["client_id", UST_CLIENT_ID],
    ["response_type", "code"],
    ["display", "popup"],
    ["prompt", "login"],
    ["nonce", nonce],
    ["scope", "openid profile email offline_access"],
    [
      "code_challenge",
      createHash("sha256").update(codeVerifier).digest("base64url"),
    ],
    ["code_challenge_method", "S256"],
  ]);

  return { url: `${OAUTH_BASE}/authorize?${newParams}`, nonce, codeVerifier };
};
