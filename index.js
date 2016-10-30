/**
 * Created by Will on 10/9/2016.
 */
const Discord = require('discord.js');
const dotenv = require('dotenv').config({silent: true});
const shuffle = require('knuth-shuffle').knuthShuffle;
const fs = require('fs');
const queue = require('queue');

const client = new Discord.Client();

client.on('message', msg => {
    if(msg.content == '!plebhorn' && msg.member.voiceChannel)  {

        let q;
        if(msg.guild.queue) {
            q = msg.guild.queue;
        }   else    {
            q = queue();
            msg.guild.queue = q;
        }

        q.concurrency = 1;

        q.once('end', () => {
            msg.member.voiceChannel.leave();
            msg.guild.queue_started = false;
        });

        q.push((cb) => {
            Promise.all([
                new Promise((resolve, reject) => fs.readdir('audio', (err, success) => {
                    if (err) {
                        reject(err);
                    } else if (success.length == 0) {
                        reject();
                    } else {
                        resolve(success);
                    }
                })).then(shuffle),
                msg.member.voiceChannel.join()
            ]).then(resolutions => {
                return resolutions[1].playFile('audio/' + resolutions[0][0]);
            }).then(dispatcher => {
                dispatcher.setVolume(0.5);
                dispatcher.once('end', () => {
                    cb();
                });
            }).catch(console.error)
        });

        if(!msg.guild.queue_started) {
            q.start();
        }
    }
});

client.on('ready', () => {
    console.log('ready');
});

client.login(process.env.discord_token).catch(err => {
    console.error(err);
});