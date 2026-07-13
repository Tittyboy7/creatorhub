const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;

function getOAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function createOAuthState() {
  return crypto.randomUUID();
}

export function setOAuthStateCookie({
  response,
  cookieName,
  state,
}) {
  if (!response) {
    throw new Error("Missing OAuth response.");
  }

  if (!cookieName) {
    throw new Error("Missing OAuth state cookie name.");
  }

  if (!state) {
    throw new Error("Missing OAuth state.");
  }

  response.cookies.set(cookieName, state, {
    ...getOAuthCookieOptions(),
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export function clearOAuthStateCookie({
  response,
  cookieName,
}) {
  if (!response) {
    throw new Error("Missing OAuth response.");
  }

  if (!cookieName) {
    throw new Error("Missing OAuth state cookie name.");
  }

  response.cookies.set(cookieName, "", {
    ...getOAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}

export function getStoredOAuthState(request, cookieName) {
  if (!request || !cookieName) {
    return null;
  }

  return request.cookies.get(cookieName)?.value || null;
}

export function isValidOAuthState({
  returnedState,
  storedState,
}) {
  return Boolean(
    returnedState &&
      storedState &&
      returnedState === storedState
  );
}