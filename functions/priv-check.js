const MongoClient = require('mongodb').MongoClient
require('dotenv').config()


module.exports = async function privCheck(message, privReq) {
    return new Promise((resolve, reject) => {
        try {

            //connect to the correct collection
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri, {useNewUrlParser: true});
            client.connect(err => {
                const collection = client.db(process.env.MONGO_NAME).collection("roles");

                if (message.guild == null) {
                    message.reply("You cannot perform that action in DMs.")
                } else {
                    //build query
                    let query = {'privilege': privReq, "guild_id": message.guild.id}
                    let get_promise = collection.findOne(query)
                    get_promise.then(function (roles) {
                        if (err) throw err;
                        if (roles == null) {
                            reject(null);
                            message.reply("this server doesn't have the correct roles.")
                        }

                        //if the user has any of the roles in the list of roles permitted to take the action, then resolve.
                        if (message.member.roles.find(r => roles['roles'].includes(r.name))) {
                            resolve(null);
                            //otherwise, reject with a message explaining why.
                        } else {
                            reject(null);
                            message.reply("you don't have the privileges required to do that.")
                        }

                    });
                }
            });

        } catch (err) {
            message.reply("Error: " + err)
            //reject(err);
        }
    });
}
