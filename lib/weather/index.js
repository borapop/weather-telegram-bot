var config = require('../../config');
var GoogleMapsAPI = require('googlemaps');
var ForecastIo = require('forecastio');
var forecastIo = new ForecastIo(config.get('forecastToken'));

var publicConfig = {
  key: config.get('googleMapsToken'),
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true // use https
};

var options = {
    units: "si",
    lang: "en",
    exclude: 'daily, alerts, flags'
  }; 

var gmAPI = new GoogleMapsAPI(publicConfig);

var Weather = {};


Weather.getByCoordinates = function(latitude, longitude, cb) {
  forecastIo.forecast(latitude, longitude, options)
    .then(function(weatherData) {
      if (!weatherData) {
        cb(new Error('Error while getting weather'));
      } else {
        cb(null, weatherData);
      }
    });
};

Weather.getByQuery = function(query, cb) {
  gmAPI.geocode({
    "address": query
  }, function(err, geoData) {
    
    if (err || !geoData.results[0]) {
      cb(new Error('Error while geocoding'));
    } else {
      forecastIo.forecast(geoData.results[0].geometry.location.lat,
                          geoData.results[0].geometry.location.lng,
                          options)
      .then(function(weatherData) {
        if (!weatherData) {
          cb(new Error('Error while getting weather'));
        } else {
          cb(null, weatherData, geoData);
        }
      });
    }
  });
};

module.exports = Weather;