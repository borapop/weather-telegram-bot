var config = require('./config');

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(config.get('telegramToken'), {polling: true});

var Weather = require('./lib/weather');

var View = require('./lib/view');

bot.on('message', function(msg, match){
  
  if (msg.text == '/start') {
    bot.sendMessage(msg.from.id, View.startMessage, {
      parse_mode: "HTML"
    });
  } else {
    Weather.getByQuery(msg.text, function(err, weatherData, geoData) {
      var message = View.makeMessage(err, weatherData, geoData);
      if (message) {
        bot.sendMessage(msg.from.id, message, {
          parse_mode: "HTML"
        });
      }
     
    });
  }
  
});

bot.on('location', function(msg, match){
  Weather.getByCoordinates(msg.location.latitude, msg.location.longitude,
  function(err, weatherData){
    var message = View.makeMessage(err, weatherData, null);
    if (message) {
      bot.sendMessage(msg.from.id, message, {
        parse_mode: "HTML"
      });
    }
  });
});

bot.on('inline_query', function(msg, match){
  if ((msg.query == '') && msg.location) {
    Weather.getByCoordinates(msg.location.latitude, msg.location.longitude,
      function(err, weatherData){
        var inline = View.makeInline(err, weatherData, null);
        var message = View.makeMessage(err, weatherData, null);
        if (inline && message) {
          bot.answerInlineQuery(msg.id, [{
            id: msg.id,
            type: "article",
            description: inline[1],
            input_message_content: {
              message_text: message,
              parse_mode: "HTML"
            },
            title: inline[0]
          }]);
        }
      });
    
  } else {
    Weather.getByQuery(msg.query, function(err, weatherData, geoData) {
      var message = View.makeMessage(err, weatherData, geoData);
      var inline = View.makeInline(err, weatherData, geoData);
      if (inline && message) {
        bot.answerInlineQuery(msg.id, [{
          id: msg.id,
          type: "article",
          description: inline[1],
          input_message_content: {
            message_text: message,
            parse_mode: "HTML"
          },
          title: inline[0]
        }]);
      }
     
    });
  }
});
