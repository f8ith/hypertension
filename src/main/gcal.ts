import { calendar as gCalendar } from "googleapis/build/src/apis/calendar";
import { OAuth2Client } from "google-auth-library";
import http from "node:http";
import { Socket } from "node:net";
import url from "node:url";
import { shell } from "electron";

import keys from "@/../credentials.json";
import UserData from "@/services/user-data";
import pLimit from "p-limit";
const redirectUri = "http://127.0.0.1:8000/oauth2callback";

let oauthRunning = false;

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
export const getAuthenticatedClient = async (): Promise<OAuth2Client> => {
  return new Promise((resolve, reject) => {
    if (oauthRunning) {
      reject(new Error("OAuth still running"));
      return;
    }

    const oauth2Client = new OAuth2Client(
      keys.installed.client_id,
      keys.installed.client_secret,
      redirectUri
    );

    oauth2Client.on("tokens", (tokens) => {
      if (tokens) {
        UserData.update({
          googleCredentials: tokens,
        });
      }
    });

    const data = UserData.get();
    if (data.googleCredentials) {
      oauth2Client.setCredentials(data.googleCredentials);
      resolve(oauth2Client);
      return;
    }

    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const scopes = ["https://www.googleapis.com/auth/calendar"];

    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      redirect_uri: redirectUri,
      prompt: "consent",
    });

    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    oauthRunning = true;

    const sockets: { [key: number]: Socket } = {};
    let nextSocketId = 0;

    const server = http
      .createServer(async (req, res) => {
        try {
          // Maintain a hash of all connected sockets
          if (req.url.indexOf("/oauth2callback") > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, redirectUri).searchParams;
            const code = qs.get("code");

            res.writeHead(200, { "Content-Type": "text/html" });

            // TODO: Pretty redirect
            res.end(
              "<div><p>Authentication successful! Please return to hypertension.</p></div>"
            );

            // Now that we have the code, use that to acquire tokens.
            const r = await oauth2Client.getToken(code);
            // Make sure to set the credentials on the OAuth2 client.
            oauth2Client.setCredentials(r.tokens);

            UserData.update({
              googleCredentials: r.tokens,
            });

            resolve(oauth2Client);

            server.close();

            for (const socketId in sockets) {
              console.log("socket", socketId, "destroyed");
              sockets[socketId].destroy();
            }

            oauthRunning = false;
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(8000, () => {
        console.log(authorizeUrl);
        shell.openExternal(authorizeUrl);
      });

    server.on("connection", function (socket: Socket) {
      const socketId = nextSocketId++;
      sockets[socketId] = socket;

      socket.on("close", function () {
        delete sockets[socketId];
      });
    });
  });
};

/**
 * Lists the next 10 events on the user's primary calendar.
 */
export const listEvents = async (auth: OAuth2Client) => {
  const calendar = gCalendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return;
  }
  console.log("Upcoming 10 events:");
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
};

export const gLimit = pLimit(4);
