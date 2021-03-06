const Discord = require('discord.js');
const { Command } = require('discord.js-commando');
const MongoClient = require('mongodb').MongoClient;
const printCharacter = require('../../functions/print-character');
const printPretty = require('../../functions/print-pretty');
const stats = require('../../utils/const_character');
require('dotenv').config();

module.exports = class CharacterCreateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'create-character',
            group: 'character',
            memberName: 'create-character',
            description: 'create a base DFA character',
            examples: ['`!create-character` to have the bot prompt you for the base stats of your new character. '],
            args: [
                {
                    key: 'character_name',
                    prompt: 'What is your character\'s full name?\n' +
                        'Note: You **must** perform character creation on the same server where you plan to use this character!',
                    type: 'string'
                },
                {
                    key: 'nickname',
                    prompt: 'What is your character\'s nickname? This should be the short name that you will use to refer to your character when using bot commands ' +
                        '- as such, use something short and easy to remember.',
                    type: 'string'
                },
                {
                    key: 'mantle',
                    prompt: 'What is your character\'s mantle? If you have two, you may enter them both here.',
                    type: 'string'
                },
                {
                    key: 'high_concept',
                    prompt: 'What is your high concept?',
                    type: 'string'
                },
                {
                    key: 'trouble_aspect',
                    prompt: 'What is your trouble aspect?',
                    type: 'string'
                },
                {
                    key: 'aspect',
                    prompt: 'What is your third aspect?',
                    type: 'string'
                },
                {
                    key: 'scale',
                    prompt: 'On what scale does your character operate? If you need more than one, list both here.',
                    type: 'string'
                },
                {
                    key: 'approach3',
                    prompt: 'What approach will you take at +3?\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
                {
                    key: 'approach2a',
                    prompt: 'What approach will you take at +2? (Please provide only one approach)\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
                {
                    key: 'approach2b',
                    prompt: 'What approach will you take at +2? (Please provide only one approach)\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
                {
                    key: 'approach1a',
                    prompt: 'What approach will you take at +1? (Please provide only one approach)\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
                {
                    key: 'approach1b',
                    prompt: 'What approach will you take at +1? (Please provide only one approach)\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
                {
                    key: 'approach0',
                    prompt: 'What approach will you take at +0?\nOptions: flair, focus, force, guile, haste, intellect',
                    type: 'string',
                    oneOf: stats.approaches
                },
            ]
        });
    }

    run(message, {character_name, nickname, mantle, high_concept, trouble_aspect, aspect, scale, approach3, approach2a, approach2b, approach1a, approach1b, approach0}) {
        try {

            character_name = character_name.toString().toLowerCase().trim();
            nickname = nickname.toString().toLowerCase().trim();
            mantle = mantle.toString().toLowerCase().trim();
            high_concept = high_concept.toString().toLowerCase().trim();
            trouble_aspect = trouble_aspect.toString().toLowerCase().trim();
            aspect = aspect.toString().toLowerCase().trim();
            scale = scale.toString().toLowerCase().trim();
            approach3 = approach3.toString().toLowerCase().trim();
            approach2a = approach2a.toString().toLowerCase().trim();
            approach2b = approach2b.toString().toLowerCase().trim();
            approach1a = approach1a.toString().toLowerCase().trim();
            approach1b = approach1b.toString().toLowerCase().trim();
            approach0 = approach0.toString().toLowerCase().trim();

            //connect to the "character" collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("characters");

                //define the document for the new character, including a bunch of base stats
                let character =
                    {   'user': message.author.username,
                        'userid': message.author.id,
                        'guildid': message.guild.id,
                        'character_name': character_name,
                        'nickname': nickname,
                        'imgurl': '',
                        'mantle': mantle,
                        'high_concept': {name: high_concept, desc: ''},
                        'trouble_aspect': {name: trouble_aspect, desc: ''},
                        'aspects': [{name: aspect, desc: ''}],
                        approaches: {
                            'flair': 0,
                            'focus': 0,
                            'force': 0,
                            'guile': 0,
                            'haste': 0,
                            'intellect': 0
                        },
                        refresh: 3,
                        fate_points: 0,
                        scale: scale,
                        stunts: [],
                        stress: {
                            base: {
                                marked: 0,
                                total: 6
                            }
                        },
                        conditions: {
                            'in peril': {
                                marked: 0,
                                total: 1,
                                type: 'sticky'
                            },
                            doomed: {
                                marked: 0,
                                total: 1,
                                type: 'lasting'
                            },
                            indebted: {
                                marked: 0,
                                total: 5,
                                type: 'sticky'
                            }
                        }
                    }

                // add the approach values appropriately.
                character['approaches'][approach3]  = 3;
                character['approaches'][approach2a] = 2;
                character['approaches'][approach2b] = 2;
                character['approaches'][approach1a] = 1;
                character['approaches'][approach1b] = 1;
                character['approaches'][approach0]  = 0;

                //insert new character document.
                //this will fail if the user already has a character with that  nickname (there is a unique index on the collection).
                let create_promise = collection.insertOne(character);
                create_promise.then(function (character) {

                    //print the resulting character sheet
                    let print_promise = printPretty(message, message.author.id, 'all', 'edit');
                    print_promise.then(function() {
                        message.reply("This is just a starting character sheet. You need to add your mantle's stunts, stress and conditions. " +
                            "You also get to add one additional stunt of your choice, and you purchase up to 2 more with your refresh." +
                            "You can also create up to 2 more aspects of your choice." +
                            "\nUse the !help command to find out how to update your character.")
                    });


                })
                .catch(function (err) {

                    if (err["code"] == '11000'){
                        message.reply("You already have a character with that nickname! Are you trying to edit that character?")
                    } else {
                        message.reply("Error: " + err)
                    }

                });
            });
        } catch (err) {
            message.say("Error: " + err)
        }
    }
}
