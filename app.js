var config = require('./config');
var TelegramBot = require('node-telegram-bot-api');

var bot = new TelegramBot(config.get('telegramToken'), {polling: true});

var ForecastIo = require('forecastio');
var forecastIo = new ForecastIo(config.get('forecastToken'));
var options = {
    units: "si",
    lang: "ru",
    exclude: 'minutely, hourly, daily, alerts, flags'
};



bot.on('message', function (msg, match) {
  var fromId = msg.from.id;
  
  
  if(msg.location) {
      
    getCurrentWeather(msg.location.latitude, msg.location.longitude,
      function(temperature, windSpeed, summary){
        var message  = 'В этом месте ' + temperature + 
        ' градусов, ' + summary + ', скорость ветра ' + windSpeed +
        ' м/с.';
        bot.sendMessage(fromId, message);
      }
    );
    
  } else {
    bot.sendMessage(fromId, 'Отправьте местоположение');
  }
});

function getCurrentWeather(latitude, longitude, callback) {
  forecastIo.forecast(latitude, longitude, 
  {
    units: "si",
    lang: "ru",
    exclude: 'minutely, hourly, daily, alerts, flags'
  }).then(function(data) {
    
    
    
    callback(data.currently.temperature, data.currently.windSpeed,
             data.currently.summary);
  });
}


