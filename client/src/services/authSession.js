const TOKEN_STORAGE_KEY = "factforge_access_token";

function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setAccessToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export { TOKEN_STORAGE_KEY, getAccessToken, setAccessToken, clearAccessToken };
