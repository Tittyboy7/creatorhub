import crypto from "crypto";

const PKCE_COOKIE_MAX_AGE_SECONDS = 10 * 60;

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function getPkceCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function createPkcePair() {
  const codeVerifier = base64UrlEncode(
    crypto.randomBytes(32)
  );

  const codeChallenge = base64UrlEncode(
    crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest()
  );

  return {
    codeVerifier,
    codeChallenge,
  };
}

export function setPkceVerifierCookie({
  response,
  cookieName,
  codeVerifier,
}) {
  if (!response) {
    throw new Error("Missing OAuth response.");
  }

  if (!cookieName) {
    throw new Error("Missing PKCE cookie name.");
  }

  if (!codeVerifier) {
    throw new Error("Missing PKCE code verifier.");
  }

  response.cookies.set(cookieName, codeVerifier, {
    ...getPkceCookieOptions(),
    maxAge: PKCE_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export function getStoredPkceVerifier(
  request,
  cookieName
) {
  if (!request || !cookieName) {
    return null;
  }

  return request.cookies.get(cookieName)?.value || null;
}

export function clearPkceVerifierCookie({
  response,
  cookieName,
}) {
  if (!response) {
    throw new Error("Missing OAuth response.");
  }

  if (!cookieName) {
    throw new Error("Missing PKCE cookie name.");
  }

  response.cookies.set(cookieName, "", {
    ...getPkceCookieOptions(),
    maxAge: 0,
  });

  return response;
}