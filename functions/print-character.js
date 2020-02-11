const MongoClient = require('mongodb').MongoClient;
const capitalize = require('./capitalize');
const checkPriv = require('./priv-check');
require('dotenv').config();


module.exports = function printCharacter(message, userid, nickname, scope) {
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
                    let query = {'nickname': nickname.toLowerCase(), 'userid': userid, 'guildid': message.guild.id};
                    let get_promise = collection.findOne(query);
                    get_promise.then(function (character) {

                        if (character == null) {
                            message.reply("that character doesn't exist.");
                            reject(err)
                        } else {

                            let sheet = "__**" + character.character_name.capitalize() + "**__";
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
                                sheet = " ឵឵\n**Approaches**\n" +
                                    character.approaches.flair + "  -  Flair\n" +
                                    character.approaches.focus + "  -  Focus\n" +
                                    character.approaches.force + "  -  Force\n" +
                                    character.approaches.guile + "  -  Guile\n" +
                                    character.approaches.haste + "  -  Haste\n" +
                                    character.approaches.intellect + "  -  Intellect\n";
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
                                    sheet += stress + " : " + character.stress[stress].marked + "/" + character.stress[stress].total + '\n';
                                }
                                sheet += " ឵឵\n**Conditions**\n";
                                for (let condition in character.conditions) {
                                    sheet += condition + " : " + character.conditions[condition].marked + "/" + character.conditions[condition].total + '\n';
                                }
                                message.say(sheet)
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


