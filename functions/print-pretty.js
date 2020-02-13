const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient;
const capitalize = require('./capitalize');
const checkPriv = require('./priv-check');
const lodash = require("lodash");
require('dotenv').config();

let global_character = {};

const home = () => new Discord.RichEmbed()
      .setColor('#AAA');

const aspects = () => new Discord.RichEmbed()
      .setColor('#AAA');

const stunts = () => new Discord.RichEmbed()
      .setColor('#AAA');

const conditions = () => new Discord.RichEmbed()
      .setColor('#AAA');

const image = () => new Discord.RichEmbed()
      .setColor('#AAA');

const list = [home, aspects, stunts, conditions, image];

function getPage(i) {

    let sheet = '';
    let character = global_character;
    let response = list[i]()
        .setTimestamp();

    switch(i) {
        case 0:
            sheet = "Mantle: " + character.mantle.capitalize() + "\n" +
                "Scale: " + character.scale.capitalize() + "\n" +
                "Refresh: " + character.refresh + "\n" +
                "Fate Points: " + character.fate_points + "\n";
            response
                .setTitle(global_character.character_name.capitalize())
                .setDescription(sheet);
            sheet = '';
            let approachlist = ['', '', '', '', '', ''];
            approachlist[character.approaches.flair] += 'Flair, ';
            approachlist[character.approaches.focus] += 'Focus, ';
            approachlist[character.approaches.force] += 'Force, ';
            approachlist[character.approaches.guile] += 'Guile, ';
            approachlist[character.approaches.haste] += 'Haste, ';
            approachlist[character.approaches.intellect] += 'Intellect, ';
            let print = false;
            for (let i = 5; i >= 0; i--) {
                if (approachlist[i].length > 0) {
                    print = true
                }
                if (print) {
                    sheet += i + '  -  ' + approachlist[i].substr(0, approachlist[i].length - 2) + '\n'
                }
            }
            response
                .addField('Approaches', sheet);
            break;
        case 1:
            sheet = "[" + character.high_concept.capitalize() + "] (HC)\n" +
                "[" + character.trouble_aspect.capitalize() + "] (T)\n";
            for (let aspect in character.aspects) {
                sheet += "[" + character.aspects[aspect].capitalize() + "]\n"
            }
            response
                .setTitle(global_character.character_name.capitalize() + ': Aspects')
                .setDescription(sheet);
            break;
        case 2:
            for (let stunt in character.stunts) {
                sheet += character.stunts[stunt].capitalize() + "\n"
            }
            response
                .setTitle(global_character.character_name.capitalize() + ': Stunts')
                .setDescription(sheet);
            break;
        case 3:
            response
                .setTitle(global_character.character_name.capitalize() + ': Stress and Conditions')
            sheet = ''
            for (let stress in character.stress) {
                sheet += stress.capitalize() + " : "
                for (let i = 0; i < character.stress[stress].total; i++) {
                    sheet += '['
                    if (i < character.stress[stress].marked) {
                        sheet += 'X'
                    } else {
                        sheet += '  '
                    }
                    sheet += ']'
                }
                sheet += '\n'
            }
            response
                .addField('Stress', sheet);

            sheet = '';
            for (let condition in character.conditions) {
                sheet += condition.capitalize() + " : "
                for (let i = 0; i < character.conditions[condition].total; i++){
                    sheet += '['
                    if (i < character.conditions[condition].marked) {
                        sheet += 'X'
                    } else {
                        sheet += '  '
                    }
                    sheet += ']'
                }
                sheet += '\n'
            }
            response
                .addField('Conditions', sheet);
            break;
        case 4:
            response
                .setTitle(global_character.character_name.capitalize() + ': Image')
            if (character.imgurl != ''){
                response
                    .setImage(character.imgurl);
            } else {
                response
                    .setDescription('You don\'t have an image for your character.')
            }

            break;
    }
    return response
}

function filter(reaction, user){
  return (!user.bot) && (emojiList.includes(reaction.emoji.name)); // check if the emoji is inside the list of emojis, and if the user is not a bot
}

const emojiList = ['🏠', '🇦', '🇸', '🇨', '📷'];

function onCollect(emoji, message, i, getPage) {
    switch (emoji.name){
        case '🏠':
            message.edit(getPage(0));
            break;
        case '🇦':
            message.edit(getPage(1));
            break;
        case '🇸':
            message.edit(getPage(2));
            break;
        case '🇨':
            message.edit(getPage(3));
            break;
        case '📷':
            message.edit(getPage(4));
            break;
    }
}

const time = 360000;

function createCollectorMessage(message, getPage) {
  let i = 0;
  const collector = message.createReactionCollector(filter, { time });
  collector.on('collect', r => {
    i = onCollect(r.emoji, message, i, getPage);
  });
  collector.on('end', collected => message.clearReactions());
}

function sendSheet(message){
    message.say(getPage(0))
        .then(msg => msg.react(emojiList[0]))
        .then(msgReaction => msgReaction.message.react(emojiList[1]))
        .then(msgReaction => msgReaction.message.react(emojiList[2]))
        .then(msgReaction => msgReaction.message.react(emojiList[3]))
        .then(msgReaction => msgReaction.message.react(emojiList[4]))
        .then(msgReaction => createCollectorMessage(msgReaction.message, getPage));
}

module.exports = function printPretty(message, userid, scope, reason) {
    return new Promise((resolve, reject) => {
        try {
            //check for the ability to print the character
            let priv = 'allchar_view';
            if (userid == message.author.id) {
                priv = 'mychar_view'
            }

            let priv_promise = checkPriv(message, priv);
            priv_promise.then(function () {

                //connect to the "characters" collection
                const uri = process.env.MONGO_URI;
                const client = new MongoClient(uri, {useNewUrlParser: true});
                client.connect(err => {
                    const collection = client.db(process.env.MONGO_NAME).collection("characters");

                    userid = userid.replace('<', '').replace('>', '').replace('@', '').replace('!', '');

                    //query for the character by nickname and user (this is unique)
                    let query = {'userid': userid, 'guildid': message.guild.id};
                    let get_promise = collection.findOne(query);
                    get_promise.then(function (character) {

                        if (character == null) {
                            message.reply("that character doesn't exist.");
                            reject(err)
                        } else {
                            global_character = character;
                            sendSheet(message);
                        }

                    });
                });
            });
        }catch (err) {
            message.reply("Error: " + err);
            reject(err);
        }
    });
}