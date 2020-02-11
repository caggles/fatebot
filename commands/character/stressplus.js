const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class StressPlusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stress+',
            group: 'character',
            memberName: 'stress+',
            description: 'add stress to your character',
            examples: ['`!stress+ nickname type number`'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname?',
                    type: 'string'
                },
                {
                    key: 'type',
                    prompt: 'What type of stress are you marking? (This is probably base unless you\'re doing something specific)',
                    type: 'string'
                },
                {
                    key: 'stress',
                    prompt: 'How many stress are you marking?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(message, {nickname, type, stress}) {
        try {

            nickname = nickname.toString().toLowerCase().trim();
            type = type.toString().toLowerCase().trim();
            stress = parseInt(stress);

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given nickname and the user's ID, to make sure nobody can edit another person's character.
                let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id};

                //update the document with the new stunt
                let find_promise = collection.findOne(query);
                find_promise.then(function (character) {

                    let type_stress = character["stress"][type]["marked"];
                    let base_stress = character["stress"]["base"]["marked"];

                    if (type != "base" && character["stress"][type] != null) {
                        let type_left = character["stress"][type]["total"] - character["stress"][type]["marked"];
                        if (type_left > stress) {
                            type_stress += stress;
                        } else {
                            type_stress += type_left;
                            stress -= type_left;
                        }
                    }

                    let base_left = character["stress"]["base"]["total"] - character["stress"]["base"]["marked"];

                    if (stress > base_left) {
                        throw "You don't have enough stress boxes left to take this damage. Mitigate some with a condition and try again."
                    } else {

                        base_stress += stress;
                        let query = {nickname: nickname.toLowerCase(), userid: message.author.id, guildid: message.guild.id};
                        let update = { $set: {"stress.base.marked": base_stress }};
                        if (character["stress"][type] != null) {
                            let type_field = "stress." + type + ".marked";
                            update = { $set: {"stress.base.marked": base_stress,  [type_field]: type_stress}}
                        }

                        let update_promise = collection.findOneAndUpdate(query, update);
                        update_promise.then(function (character) {

                            let print_promise = printCharacter(message, message.author.id, character["value"]["nickname"], 'stress')

                        });

                    }

                })
                .catch(function (err) {
                    message.reply('Error: ' + err)
                });
            });
        } catch (err) {
            message.reply('Error: ' + err)
        }
    }
}
