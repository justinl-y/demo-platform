function getHealthDB(req, rep) {
  const healthDB = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };

  rep.send(healthDB);

  return rep;
}

module.exports = getHealthDB;
