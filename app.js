var config = require('./config');
var TelegramBot = require('node-telegram-bot-api');
var GoogleMapsAPI = require('googlemaps');
var bot = new TelegramBot(config.get('telegramToken'), {polling: true});

var ForecastIo = require('forecastio');
var forecastIo = new ForecastIo(config.get('forecastToken'));

var publicConfig = {
  key: config.get('googleMapsToken'),
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);


bot.on('message', function (msg, match) {
  var fromId = msg.from.id;
  console.log(msg);
  
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

bot.on('inline_query', function(msg, match){
  if (msg.query == '') {
    console.log(msg);
    if (msg.location) {
      getCurrentWeather(msg.location.latitude, msg.location.longitude,
        function(temperature, windSpeed, summary){
          var description = temperature + ' °с, ' + summary;
          var message  = 'Здесь ' + temperature + 
          ' градусов, ' + summary + ', скорость ветра ' + windSpeed +
          ' м/с.';
          bot.answerInlineQuery(msg.id, [{
            id: msg.id,
            type: "article",
            description: description,
            input_message_content: {
              message_text: message
              
            },
            title: "Ваше местоположение"
          }]);
        }
      );
    }
  } else {
     getCoordinates(msg.query, function(res) {
       getCurrentWeather(res.geometry.location.lat, res.geometry.location.lng,
        function(temperature, windSpeed, summary){
          var description = temperature + ' °с, ' + summary;
          var message  = '<b>' + res.formatted_address + '<\/b> &#10;' +
          temperature + 
          ' градусов, ' + summary + ', скорость ветра ' + windSpeed +
          ' м/с.';
          bot.answerInlineQuery(msg.id, [{
            id: msg.id,
            type: "article",
            description: description,
            input_message_content: {
              message_text: message,
              parse_mode: "HTML"
            },
            title: res.formatted_address
          }]);
        }
      );
     })
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

function getCoordinates(query, callback) {
  gmAPI.geocode({
    "address": query
  }, function(err, res) {
    console.log(res);
    if (!err && res.results[0]) {
      callback(res.results[0]);
    } 
  });
}

