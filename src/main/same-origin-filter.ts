import { WebRequest } from "electron";

/**
 * Installs a web request filter to prevent cross domain leaks of auth headers
  
 Credits: https://github.com/desktop/desktop/blob/3f224080dd0a9cea5a981bdd977509cf4a775630/app/src/main-process/same-origin-filter.ts
 */

export function installSameOriginFilter(webRequest: WebRequest) {
  // A map between the request ID and the _initial_ request origin
  const requestOrigin = new Map<number, string>();
  const safeProtocols = new Set(["devtools:", "file:", "chrome-extension:"]);
  const unsafeHeaders = new Set(["authentication", "authorization", "cookie"]);

  webRequest.onBeforeRequest(async (details) => {
    const { protocol, origin } = new URL(details.url);

    // This is called once for the initial request and then once for each
    // "subrequest" thereafter, i.e. a request to https://foo/bar which gets
    // redirected to https://foo/baz will trigger this twice and we only
    // care about capturing the initial request origin
    if (!safeProtocols.has(protocol) && !requestOrigin.has(details.id)) {
      requestOrigin.set(details.id, origin);
    }

    return {};
  });

  webRequest.onBeforeSendHeaders(async (details) => {
    const initialOrigin = requestOrigin.get(details.id);
    const { origin } = new URL(details.url);

    if (initialOrigin === undefined || initialOrigin === origin) {
      return { requestHeaders: details.requestHeaders };
    }

    const sanitizedHeaders: Record<string, string> = {};

    for (const [k, v] of Object.entries(details.requestHeaders)) {
      if (!unsafeHeaders.has(k.toLowerCase())) {
        sanitizedHeaders[k] = v;
      }
    }

    console.log(`Sanitizing cross-origin redirect to ${origin}`);
    return { requestHeaders: sanitizedHeaders };
  });

  webRequest.onCompleted((details) => requestOrigin.delete(details.id));
}
