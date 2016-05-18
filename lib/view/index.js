var config = require('../../config');

var View = {}



View.makeMessage = function(err, weatherData, geoData) {
  if (err) {
    return null;
  } else {
    
    var message = '';
    if (geoData) {
      message += '<b>' + geoData.results[0].formatted_address
      + '<\/b> &#10;';
    } else {
       message += 'Там, где я нахожусь ';
    }
    message += Math.round(weatherData.currently.temperature * 10)/10
    + ' °с, &#10;' +  weatherData.currently.summary + ', скорость ветра '
    + weatherData.currently.windSpeed
    + ' м/с. &#10;'
    + 'Погода по часам: &#10;';
    var hourly = "";
    var time;
    for(var i = 0; (i < weatherData.hourly.data.length) && (i < 12); i++) {
      time = new Date(weatherData.hourly.data[i].time * 1000 + weatherData.offset * 3600000);
      time = time.getHours();
      hourly +=  time + '| '
        + config.get('icons:' + weatherData.hourly.data[i].icon) + ' '
        + Math.round(weatherData.hourly.data[i].temperature * 10)/10 + ' °&#10;';
    }
    
    return message + hourly;
        
      
  }
};

View.makeInline = function(err, weatherData, geoData) {
  if (err) {
    return null;
  } else {
    var title;
    if (geoData) {
      title = geoData.results[0].formatted_address;
    } else {
      title = 'Ваше местоположение';
    }
    var description = weatherData.currently.temperature + ' °с,'
    + weatherData.currently.summary;
    
    return [title, description];
  }
};


module.exports = View;