#!/usr/bin/env node
/* eslint-disable no-console -- CLI script; its output is the point */
/**
 * One-time Google sign-in for the home-page reviews carousel (README → Google
 * reviews). Run it on your own computer, signed in as the account that owns
 * the shop's Business Profile.
 *
 *   npm run google:auth                   opens Google's sign-in page and saves
 *                                         GOOGLE_BUSINESS_REFRESH_TOKEN to .env.local
 *   npm run google:auth -- --locations    once Google has approved API access: prints
 *                                         the IDs and links for siteConfig.googleBusiness
 *
 * Needs GOOGLE_BUSINESS_CLIENT_ID and GOOGLE_BUSINESS_CLIENT_SECRET (an OAuth
 * client of type "Desktop app") in .env.local. The token never goes to the
 * terminal, only to .env.local.
 */
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";

const ENV_FILE = new URL("../.env.local", import.meta.url);
const TOKEN_KEY = "GOOGLE_BUSINESS_REFRESH_TOKEN";
const SCOPES = ["openid", "email", "https://www.googleapis.com/auth/business.manage"];
const SIGN_IN_TIMEOUT_MS = 5 * 60 * 1000;

const env = await readFile(ENV_FILE, "utf8").catch(() => "");
/** `vercel env pull` writes values in double quotes; hand-written lines may not. */
const read = (name) =>
  env
    .match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]
    ?.trim()
    .replace(/^"(.*)"$/, "$1") || undefined;

const clientId = read("GOOGLE_BUSINESS_CLIENT_ID");
const clientSecret = read("GOOGLE_BUSINESS_CLIENT_SECRET");
if (!clientId || !clientSecret) {
  throw new Error(
    "Add GOOGLE_BUSINESS_CLIENT_ID and GOOGLE_BUSINESS_CLIENT_SECRET to .env.local first (README → Google reviews).",
  );
}

async function postToken(params) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      ...params,
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Google sign-in failed: ${body.error_description ?? body.error}`);
  }
  return body;
}

/** The id_token comes straight from Google over TLS; it is decoded only to show the email. */
function signedInEmail(idToken) {
  const payload = idToken?.split(".")[1];
  if (!payload) return undefined;
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).email;
}

async function googleGet(url, accessToken) {
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(
      response.status === 403 || response.status === 429
        ? `${message}\nIf the quota is still 0, Google has not approved API access yet.`
        : message,
    );
  }
  return body;
}

async function listLocations() {
  const refreshToken = read(TOKEN_KEY);
  if (!refreshToken)
    throw new Error(`No ${TOKEN_KEY} in .env.local: run npm run google:auth first.`);
  const { access_token: accessToken } = await postToken({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const { accounts = [] } = await googleGet(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    accessToken,
  );
  if (accounts.length === 0)
    console.log("This Google account manages no Business Profiles.");

  for (const account of accounts) {
    const accountId = account.name.replace("accounts/", "");
    const url = new URL(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
    );
    url.searchParams.set("readMask", "name,title,metadata");
    const { locations = [] } = await googleGet(url, accessToken);

    for (const location of locations) {
      const locationId = location.name.replace("locations/", "");
      const reviews = await googleGet(
        `https://mybusiness.googleapis.com/v4/${account.name}/${location.name}/reviews?pageSize=1`,
        accessToken,
      );
      console.log(`\n${location.title} (account: ${account.accountName ?? accountId})`);
      console.log(
        `  Rating ${reviews.averageRating ?? "?"} from ${reviews.totalReviewCount ?? 0} reviews`,
      );
      console.log("  For siteConfig.googleBusiness in src/lib/site-config.ts:");
      console.log(`    accountId: "${accountId}",`);
      console.log(`    locationId: "${locationId}",`);
      console.log(`    reviewsUrl: "${location.metadata?.mapsUri ?? ""}",`);
      console.log(`    writeReviewUrl: "${location.metadata?.newReviewUri ?? ""}",`);
    }
  }
}

async function signIn() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("hex");

  // Google allows any loopback port for "Desktop app" clients, so no redirect URI
  // has to be registered in the Cloud console.
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const redirectUri = `http://127.0.0.1:${server.address().port}`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    // offline + consent make Google return a refresh token every time.
    access_type: "offline",
    prompt: "consent",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  }).toString();

  console.log(
    "Opening Google's sign-in page. If it does not open, paste this into a browser:",
  );
  console.log(`\n${authUrl}\n`);
  console.log("Sign in with the account that owns the shop's Business Profile.");
  spawn("open", [authUrl.toString()], { stdio: "ignore" }).on("error", () => {});

  /** Trades Google's one-time code for the refresh token and saves it. */
  async function saveToken(code) {
    const tokens = await postToken({
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    if (!tokens.refresh_token)
      throw new Error("Google returned no refresh token. Run it again.");
    if (!tokens.scope?.includes("business.manage")) {
      throw new Error(
        "The Business Profile permission was not granted. Run it again and tick it.",
      );
    }
    const line = `${TOKEN_KEY}=${tokens.refresh_token}`;
    const pattern = new RegExp(`^${TOKEN_KEY}=.*$`, "m");
    await writeFile(
      ENV_FILE,
      pattern.test(env) ? env.replace(pattern, line) : `${env.trimEnd()}\n${line}\n`,
    );
    return signedInEmail(tokens.id_token) ?? "an unknown account";
  }

  const email = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("No answer from Google within 5 minutes. Run it again.")),
      SIGN_IN_TIMEOUT_MS,
    );
    server.on("request", async (request, response) => {
      const params = new URL(request.url ?? "/", redirectUri).searchParams;
      if (!params.has("code") && !params.has("error")) {
        response.writeHead(404).end();
        return;
      }
      clearTimeout(timer);
      // The browser tab only says "Signed in" once the token is actually saved.
      const outcome = await (
        params.get("state") === state && params.has("code")
          ? saveToken(params.get("code"))
          : Promise.reject(
              new Error(
                `Google sign-in failed: ${params.get("error") ?? "state mismatch"}`,
              ),
            )
      ).then(
        (value) => ({ ok: true, value }),
        (error) => ({ ok: false, error }),
      );
      response
        // connection: close, so a keep-alive socket does not hold the script open.
        .writeHead(outcome.ok ? 200 : 400, {
          "content-type": "text/plain; charset=utf-8",
          connection: "close",
        })
        .end(
          outcome.ok
            ? "Signed in. You can close this tab."
            : "Sign-in failed. See the terminal.",
        );
      if (outcome.ok) resolve(outcome.value);
      else reject(outcome.error);
    });
  }).finally(() => server.close());

  console.log(`Signed in as ${email}.`);
  console.log(`Saved ${TOKEN_KEY} to .env.local.`);
  console.log("Once Google approves API access: npm run google:auth -- --locations");
}

await (process.argv.includes("--locations") ? listLocations() : signIn());
