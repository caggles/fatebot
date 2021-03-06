const MongoClient = require('mongodb').MongoClient;
const capitalize = require('./capitalize');
const checkPriv = require('./priv-check');
const lodash = require("lodash");
require('dotenv').config();


module.exports = function printCharacter(message, userid, scope, reason) {
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

                    userid = userid.replace('<','').replace('>','').replace('@', '').replace('!','');

                    //query for the character by nickname and user (this is unique)
                    let query = {'userid': userid, 'guildid': message.guild.id};
                    let get_promise = collection.findOne(query);
                    get_promise.then(function (character) {

                        if (character == null) {
                            message.reply("that character doesn't exist.");
                            reject(err)
                        } else {

                            let sheet = "__**" + character.character_name.capitalize() + "**__ (" + character.nickname.capitalize() + ")";
                            message.say(sheet)

                            if (scope == "base" || scope == "all") {
                                sheet = " ឵឵\nMantle: " + character.mantle.capitalize() + "\n" +
                                    "Scale: " + character.scale.capitalize() + "\n" +
                                    "Refresh: " + character.refresh + "\n" +
                                    "Fate Points: " + character.fate_points + "\n";
                                message.say(sheet)
                            }

                            if (scope == "aspects" || scope == "all") {
                                sheet = " ឵឵\n**Aspects**:\n" +
                                    "[" + character.high_concept.capitalize() + "] (HC)\n" +
                                    "[" + character.trouble_aspect.capitalize() + "] (T)\n";
                                for (let aspect in character.aspects) {
                                    sheet += "[" + character.aspects[aspect].capitalize() + "]\n"
                                }
                                message.say(sheet)
                            }

                            if (scope == "approaches" || scope == "all") {
                                let approachlist = ['', '', '', '', '', ''];
                                approachlist[character.approaches.flair] += 'Flair, ';
                                approachlist[character.approaches.focus] += 'Focus, ';
                                approachlist[character.approaches.force] += 'Force, ';
                                approachlist[character.approaches.guile] += 'Guile, ';
                                approachlist[character.approaches.haste] += 'Haste, ';
                                approachlist[character.approaches.intellect] += 'Intellect, ';

                                sheet = " ឵឵\n**Approaches**\n"

                                let print = false
                                for (let i = 5; i >= 0; i--) {
                                    if (approachlist[i].length > 0) {
                                        print = true
                                    }
                                    if (print) {
                                        sheet += i + '  -  ' + approachlist[i].substr(0, approachlist[i].length - 2) + '\n'
                                    }
                                }

                                message.say(sheet)
                            }

                            if (scope == "stunts" || scope == "all") {
                                sheet = " ឵឵\n**Stunts**\n"
                                for (let stunt in character.stunts) {
                                    sheet += character.stunts[stunt].capitalize() + "\n"
                                }
                                message.say(sheet)
                            }

                            if (scope == "condition" || scope == "stress" || scope == "all") {
                                sheet = " ឵឵\n**Stress**\n";
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

                                sheet += " ឵឵\n**Conditions**\n";
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
                                message.say(sheet)
                            }

                            if (reason == 'edit') {
                                let gmrole = message.guild.roles.find(role => role.name === "GM");
                                message.say( '<@&' + gmrole.id + '>, ' + character.character_name.capitalize() + ' has been edited. Please review.')
                            }

                            resolve(null);
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


