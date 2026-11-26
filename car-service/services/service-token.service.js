const axios = require("axios");

let cachedToken = null;
let tokenExpiresAt = 0;

const getServiceToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(
    `${process.env.AUTH_SERVICE_URL}/oauth/token`,
    {
      grant_type: "client_credentials",
      client_id: process.env.SERVICE_CLIENT_ID,
      client_secret: process.env.SERVICE_CLIENT_SECRET,
    },
  );

  cachedToken = response.data.access_token;

  tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 3000;

  return cachedToken;
};

module.exports = { getServiceToken };
