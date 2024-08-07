const { Given, When, Then, Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const mqtt = require('mqtt');
const assert = require('assert');
const dotenv = require('dotenv');
dotenv.config();
let client;
const mqttUrl = process.env.MQTT_URL

Before({ tags: '@mqtt', name: 'Connect to mqtt client' },
    function () {
        var world = this
        return new Promise(function (resolve, reject) {
            console.log("mqttUrl",mqttUrl);
            
            world.client = mqtt.connect(mqttUrl);
            world.client.on('connect', () => {
                console.log("in bef hooks end");
                resolve();
            })

            world.client.on('error', (err) => {
                console.error('Connection error:', err);
                reject(err);
            });
        })
    });



