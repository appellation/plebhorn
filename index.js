/**
 * Created by Will on 10/9/2016.
 */
const Discord = require('discord.js');
const dotenv = require('dotenv').config({silent: true});
const shuffle = require('knuth-shuffle').knuthShuffle;
const fs = require('fs');

const client = new Discord.Client();

let complete = true;
client.on('message', msg => {
    if(msg.content == '!plebhorn' && complete && msg.member.voiceChannel)  {
        complete = false;
        Promise.all([
            new Promise((resolve, reject) => fs.readdir('audio', (err, success) => {
                if(err) {
                    reject(err);
                }   else if(success.length == 0)    {
                    reject();
                }   else    {
                    resolve(success);
                }
            })).then(shuffle),
            msg.member.voiceChannel.join()
        ]).then(resolutions => {
            return resolutions[1].playFile('audio/' + resolutions[0][0]);
        }).then(dispatcher => {
            dispatcher.setVolume(0.5);
            dispatcher.on('end', () => {
                msg.member.voiceChannel.leave();
                complete = true;
            });
        }).catch(err => {
            console.error(err);
        });
    }
});

client.on('ready', () => {
    console.log('ready');
});

client.login(process.env.discord_token).catch(err => {
    console.error(err);
});