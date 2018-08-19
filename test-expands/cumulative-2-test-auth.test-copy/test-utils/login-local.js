
module.exports = async function (appClient, email, password) {
  try {
    await appClient.authenticate({
      strategy: 'local',
      email,
      password,
    });
  } catch(err) {
    throw err;
  }
};
