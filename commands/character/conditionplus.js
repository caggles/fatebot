const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const printCharacter = require('../../functions/print-character')
require('../../functions/capitalize')
const stats = require('../../utils/const_character');
require('dotenv').config()

module.exports = class ConditionPlusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'condition+',
            group: 'character',
            memberName: 'condition+',
            description: 'add a condition to your character',
            examples: ['`!condition+ type number`'],
            args: [
                {
                    key: 'type',
                    prompt: 'What condition are you marking?',
                    type: 'string'
                },
                {
                    key: 'boxes',
                    prompt: 'How many boxes are you marking?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(message, {type, boxes}) {
        try {

            type = type.toString().toLowerCase().trim();
            boxes = parseInt(boxes);

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //query against the given the user's ID and guild ID, to make sure nobody can edit another person's character.
                let query = {userid: message.author.id, guildid: message.guild.id};

                let find_promise = collection.findOne(query);
                find_promise.then(function (character) {

                    if (character["conditions"][type] == undefined) {
                        throw "You don't have that condition. Please try again."
                    } else {
                        if (character["conditions"][type]["marked"] + boxes > character["conditions"][type]["total"]) {

                        let print_promise = printCharacter(message, message.author.id,'condition', 'view')
                        throw "You don't have enough boxes in this condition to add that many ticks."

                    } else {

                        let query = {userid: message.author.id, guildid: message.guild.id};
                        let field = "conditions." + type + ".marked"
                        let update = { $inc: {[field]: boxes }};

                        let update_promise = collection.findOneAndUpdate(query, update);
                        update_promise.then(function (character) {

                            let print_promise = printCharacter(message, message.author.id, 'condition', 'view')

                        });

                    }
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
