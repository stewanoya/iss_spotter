const request = require("request");

const fetchMyIP = (callback) => {
  request(`http://api.ipify.org?format=json`, (error, response, body) => {
    const errorMsg = `There was an error. See -> ${error}`;
    if (error) {
      return callback(errorMsg, null);
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response ${body}`;
      callback(Error(msg), null);
      return;
    }
    let ip = JSON.parse(body);
    ip = ip.ip;
    callback(null, ip);
    return;
  });
};

const fetchCoordsByIP = (ip, callback) => {
  request(
    `https://api.freegeoip.app/json/${ip}?apikey=a509e080-3dca-11ec-b9d4-f5d270f46386`,
    (error, response, body) => {
      if (error) {
        return callback(error, null);
      }
      if (response.statusCode !== 200) {
        callback(
          Error(
            `Looks like we got an error from our API: ${response.statusCode}`
          ),
          null
        );
        return;
      }
      const location = JSON.parse(body);
      let latLon = {};
      latLon.latitude = location.latitude;
      latLon.longitude = location.longitude;
      callback(null, latLon);
    }
  );
};

const fetchISSFlyOverTimes = (coords, callback) => {
  request(
    `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`,
    (error, response, body) => {
      if (error) {
        return callback(error, null);
      }
      const nextPasses = JSON.parse(body).response;
      callback(nextPasses);
    }
  );
};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {
  nextISSTimesForMyLocation,
};
