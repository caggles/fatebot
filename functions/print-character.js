const MongoClient = require('mongodb').MongoClient
const capitalize = require('./capitalize')
const checkPriv = require('./priv-check')
require('dotenv').config()


module.exports = function printCharacter(message, userid, nickname, scope) {
    return new Promise((resolve, reject) => {
        try {

            //check for the ability to print the character
            let priv = 'allchar_view'
            if (userid == message.author.id) {
                priv = 'mychar_view'
            }

            let priv_promise = checkPriv(message, priv)
            priv_promise.then(function () {

                //connect to the "characters" collection
                const uri = process.env.MONGO_URI
                const client = new MongoClient(uri, {useNewUrlParser: true});
                client.connect(err => {
                    const collection = client.db(process.env.MONGO_NAME).collection("characters");

                    userid = userid.replace('<','').replace('>','').replace('@', '').replace('!','')

                    //query for the character by shadow name and user (this is unique)
                    let query = {'nickname': nickname.toLowerCase(), 'userid': userid, 'guildid': message.guild.id}
                    let get_promise = collection.findOne(query)
                    get_promise.then(function (character) {

                        if (character == null) {
                            message.reply("that character doesn't exist.")
                            reject(err)
                        } else {

                            let sheet = "**" + character.character_name + "**\n" +
                                "Mantle: " + character.mantle + "\n" +
                                "High Concept: " + character.high_concept + "\n" +
                                "Trouble Aspect: " + character.trouble_aspect + "\n" +
                                "Aspects: " + "\n"
                            for (let aspect in character.aspects) {
                                sheet += aspect + "\n"
                            }
                            sheet += "\n**Approaches**\n" +
                                character.approaches.flair + "\n" +
                                character.approaches.focus + "\n" +
                                character.approaches.force + "\n" +
                                character.approaches.guile + "\n" +
                                character.approaches.haste + "\n" +
                                character.approaches.intellect + "\n" +
                                "\nRefresh: " + character.refresh + "\n"

                            message.say(sheet)

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


