/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         ______     ______     ______   __  __     __     ______
        /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
        \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
         \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
          \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
for a user.

# RUN THE BOT:

Get a Bot token from Slack:

  -> http://my.slack.com/services/new/bot

Run your bot from the command line:

  token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

Find your bot inside Slack to send it a direct message.

Say: "Hello"

The bot will reply "Hello!"

Say: "who are you?"

The bot will tell you its name, where it running, and for how long.

Say: "Call me <nickname>"

Tell the bot your nickname. Now you are friends.

Say: "who am I?"

The bot will tell you your nickname, if it knows one for you.

Say: "shutdown"

The bot will ask if you are sure, and then shut itself down.

Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

Botkit has many features for building cool and useful bots!

Read all about it here:

  -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var request = require('superagent');
var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
  debug: true,
});

var bot = controller.spawn({
  token: process.env.token
}).startRTM();



controller.hears(['hello', 'hi', 'hey', 'welcome', 'yo', 'lets go', 'workout', ':muscle:'], 'direct_message,direct_mention,ambient', function(bot, message) {
  bot.startConversation(message, sayHello);
});


sayHello = function(response, convo) {
  var intro = pickIntro();
  convo.say(intro);
  workout(response, convo);
  convo.next();
}

workout = function(response, convo) {
  var movement = pickWorkout();
  convo.say('Ok, lets do '+movement);
  askHowMany(response, convo);
  convo.next();
}

askHowMany = function(response, convo) {
  convo.ask('How many workouts have you done today?', [
    {
      pattern:  /^\d{1,2}$/,
      callback: function(response, convo) {

        if(response.text > 2){

          bot.api.reactions.add({
            timestamp: response.ts,
            channel: response.channel,
            name: pickGoodEmoji(),
          }, function(err, res) {
            if (err) {
                bot.botkit.log('Failed to add emoji reaction :(', err);
            }
          });

          convo.say(pickGood());
          convo.say("*Don't forget to set an alarm for your next workout!*");
          getRandomGif('strong', function(imageUrl){
            convo.say(imageUrl);
            convo.next();
          });

        } else {
          bot.api.reactions.add({
            timestamp: response.ts,
            channel: response.channel,
            name: pickBadEmoji(),
          }, function(err, res) {
            if (err) {
                bot.botkit.log('Failed to add emoji reaction :(', err);
            }
          });

          convo.say(pickBaby());
          getRandomGif('baby', function(imageUrl){
            convo.say(imageUrl);
            convo.next();
          });
        }

      }
    },
    {
      pattern:  'stop',
      callback: function(response, convo) {
        bot.api.reactions.add({
          timestamp: response.ts,
          channel: response.channel,
          name: pickBadEmoji(),
        }, function(err, res) {
          if (err) {
              bot.botkit.log('Failed to add emoji reaction :(', err);
          }
        });

        convo.say(pickBaby());
        getRandomGif('baby', function(imageUrl){
          convo.say(imageUrl);
          convo.next();
        });
      }
    },
    {
      default: true,
      callback: function(response, convo) {
        convo.say('Sorry I need a number, stupid!');
        getRandomGif('stupid', function(imageUrl){
          convo.say(imageUrl);
          askHowMany(response, convo);
          convo.next();
        });
      }
    }
  ]);
}

  

controller.hears(['shutdown'], 'direct_message,direct_mention', function(bot, message) {

  bot.startConversation(message, function(err, convo) {

    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: bot.utterances.yes,
        callback: function(response, convo) {
            convo.say("I'll be back!");
            convo.next();
            setTimeout(function() {
                process.exit();
            }, 3000);
        }
      },
    {
      pattern: bot.utterances.no,
      default: true,
      callback: function(response, convo) {
        convo.say('*Phew!*');
        convo.next();
      }
    }
    ]);
  });
});

function getRandomGif(keyword, callback){
  var url = 'http://api.giphy.com/v1/gifs/search?q='+keyword+'&api_key=dc6zaTOxFJmzC';
    request.get(url)
    .end(function(err, res){
      if(err || !res.ok) {
        console.log(err)
        return
      }
      image = res.body.data[Math.floor(Math.random()*res.body.data.length)];
      callback(image.images.fixed_height.url);
    })
}

function pickIntro() {
  var items = Array(
    'I am here to pump you up!',
    'I am the workoutanator!',
    'Strength does not come from sitting!'
  );
  return items[Math.floor(Math.random()*items.length)];
}

function pickBaby() {
  var items = Array(
    "c'mon is that all you got? silly baby!",
    "don't be a baby!",
    'thats why tou have baby arms!'
  );
  return items[Math.floor(Math.random()*items.length)];
}

function pickBadEmoji() {
  var items = Array(
    'rage',
    'rage1',
    'rage2',
    'rage3',
    'rage4'
  );
  return items[Math.floor(Math.random()*items.length)];
}

function pickGoodEmoji() {
  var items = Array(
    'muscle::skin-tone-4',
    'weight_lifter::skin-tone-4',
    'apple'
  );
  return items[Math.floor(Math.random()*items.length)];
}

function pickGood() {
  var items = Array(
    'Keep it up!',
    'Thats what I am talking about!',
    'Do you have a permit for those guns?'
  )
  return items[Math.floor(Math.random()*items.length)];
}

function pickWorkout() {
  var items = Array(
    'a *wall sit*',
    'some *push ups*',
    'a *plank*',
    'some *jumping jacks*',
    'some *chair dips*',
    'some *crunces*',
    'some *step ups*',
    'some *lunges*'
  );
  return items[Math.floor(Math.random()*items.length)];
}
