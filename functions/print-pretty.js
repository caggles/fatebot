const Discord = require('discord.js');
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

const map = {'home': home, 'aspects': aspects, 'stunts': stunts, 'conditions': conditions, 'image': image};

function getMap(name) {
  return map[name]();
}

function getPage(message, name) {

    let sheet = '';
    let character = global_character[message.id];
    let response = getMap(name)
        .setTimestamp();

    switch(name) {
        case 'home':
            sheet = "Mantle: " + character.mantle.capitalize() + "\n" +
                "Scale: " + character.scale.capitalize() + "\n" +
                "Refresh: " + character.refresh + "\n" +
                "Fate Points: " + character.fate_points + "\n";
            response
                .setTitle(character.character_name.capitalize())
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

            if (character.stunts.length > 0) {
                sheet = '';
                for (let stunt in character.stunts) {
                    sheet += character.stunts[stunt].name.capitalize() + "\n"
                }
                response
                    .addField('Stunts', sheet);
            }

            break;
        case 'aspects':
            sheet = "**[" + character.high_concept.name.capitalize() + "] (HC)**\n";
            if (character.high_concept.desc != '') {
                if (character.high_concept.desc.length > 250) {
                    character.high_concept.desc = character.high_concept.desc.substr(0, 247) + '...';
                }
                sheet += character.high_concept.desc + '\n';
            }
            sheet += '\n'
            sheet += "**[" + character.trouble_aspect.name.capitalize() + "] (T)**\n";
            if (character.trouble_aspect.desc != '') {
                if (character.trouble_aspect.desc.length > 250) {
                    character.trouble_aspect.desc = character.trouble_aspect.desc.substr(0, 247) + '...';
                }
                sheet += character.trouble_aspect.desc + '\n';
            }
            sheet += '\n'
            for (let aspect in character.aspects) {
                sheet += "**[" + character.aspects[aspect].name.capitalize() + "]**\n"
                if (character.aspects[aspect].desc != '') {
                    if (character.aspects[aspect].desc.length > 250) {
                        character.aspects[aspect].desc = character.aspects[aspect].desc.substr(0, 247) + '...';
                    }
                    sheet += character.aspects[aspect].desc + '\n';
                }
                sheet += '\n'
            }
            response
                .setTitle(character.character_name.capitalize() + ': Aspects')
                .setDescription(sheet);
            break;
        case 'stunts':
            for (let stunt in character.stunts) {
                sheet += '**' + character.stunts[stunt].name.capitalize() + "**\n"
                if (character.stunts[stunt].desc != "") {
                    if (character.stunts[stunt].desc.length > 250) {
                        character.stunts[stunt].desc = character.stunts[stunt].desc.substr(0, 247) + '...';
                    }
                    sheet += character.stunts[stunt].desc + "\n"
                }
                sheet += '\n';
            }
            response
                .setTitle(character.character_name.capitalize() + ': Stunts')
                .setDescription(sheet);
            break;
        case 'conditions':
            response
                .setTitle(character.character_name.capitalize() + ': Stress and Conditions')
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
        case 'image':
            response
                .setTitle(character.character_name.capitalize() + ': Image')
            try {
                response
                    .setImage(character.imgurl);
            } catch {
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
            message.edit(getPage(message, 'home'));
            break;
        case '🇦':
            message.edit(getPage(message, 'aspects'));
            break;
        case '🇸':
            message.edit(getPage(message, 'stunts'));
            break;
        case '🇨':
            message.edit(getPage(message, 'conditions'));
            break;
        case '📷':
            message.edit(getPage(message, 'image'));
            break;
    }
}

const time = 2*60000;

function createCollectorMessage(message, getPage) {
  let i = 0;
  const collector = message.createReactionCollector(filter, { time });
  collector.on('collect', r => {
    i = onCollect(r.emoji, message, i, getPage);
  });
  collector.on('end', collected => endMessage(message));
  return message;
}

function endMessage(message) {
    let collected = message.clearReactions();
    delete global_character[message.id];
    console.log(global_character);
    return collected;
}

function sheetFix(printID, newID) {
    global_character[newID] = global_character[printID];
    delete global_character[printID];
    return;
}

function sendSheet(message, print_message, page){
    message.say(getPage(print_message, page))
        .then(msg => msg.react(emojiList[0]))
        .then(msgReaction => msgReaction.message.react(emojiList[1]))
        .then(msgReaction => msgReaction.message.react(emojiList[2]))
        .then(msgReaction => msgReaction.message.react(emojiList[3]))
        .then(msgReaction => msgReaction.message.react(emojiList[4]))
        .then(msgReaction => createCollectorMessage(msgReaction.message, getPage))
        .then(msg => sheetFix(print_message.id, msg.id));
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
                            global_character[message.id] = character;

                            if ((scope == "base" || scope == "approaches") && reason == 'view') {
                                sendSheet(message, message, 'home');
                            } else if (scope == "aspects" && reason == 'view') {
                                sendSheet(message, message, 'aspects');
                            } else if (scope == "stunts" && reason == 'view') {
                                sendSheet(message, message, 'stunts');
                            } else if ((scope == "condition" || scope == "stress") && reason == 'view') {
                                sendSheet(message, message, 'conditions');
                            } else if (scope == "base" || scope == "approaches") {
                                message.say(getPage(message, 'home'));
                            } else if (scope == "aspects") {
                                message.say(getPage(message, 'aspects'));
                            } else if (scope == "stunts") {
                                message.say(getPage(message, 'stunts'));
                            } else if (scope == "condition" || scope == "stress") {
                                message.say(getPage(message,'conditions'));
                            } else {
                                sendSheet(message, message, 'home');
                            }
                            if (reason == 'edit') {
                                let gmrole = message.guild.roles.find(role => role.name === "GM");
                                message.say( '<@&' + gmrole.id + '>, ' + character.character_name.capitalize() + ' has been edited. Please review.')
                            }

                        }

                    });
                });
            });
        } catch (err) {
            message.reply("Error: " + err);
            reject(err);
        }
    });
}
