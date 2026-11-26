const axios = require("axios");
const { getServiceToken } = require("./service-token.service");

const getUserById = async (userId) => {
  const accessToken = await getServiceToken();

  const response = await axios.get(
    `${process.env.USER_SERVICE_URL}/internal/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

module.exports = { getUserById };
