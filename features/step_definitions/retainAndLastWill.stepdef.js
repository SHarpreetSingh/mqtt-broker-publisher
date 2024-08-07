const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const mqtt = require('mqtt');
const dotenv = require('dotenv');
const assert = require('assert');
const { setTimeout } = require('timers/promises');

setDefaultTimeout(15000)
dotenv.config();
let client;
let receivedMessage;
const mqttUrl = process.env.MQTT_URL

When('I connect to the broker, publish a message with the retain flag set, and disconnect', function () {
    return new Promise((resolve, reject) => {
        client = mqtt.connect(mqttUrl, {
            connectTimeout: 5000,
        });

        client.on('connect', () => {
            console.log('Connected to broker');
            client.publish('retain/topic', 'Retained Message', { retain: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    client.end();
                    resolve();
                }
            });
        });

        client.on('error', (err) => {
            console.error('Connection error:', err);
            reject(err);
        });
    });
});

Then('the retained message should be received by clients subscribing to the topic after the message is published', function () {
    return new Promise((resolve, reject) => {
        const newClient = mqtt.connect(mqttUrl, {
            connectTimeout: 5000,
        });

        newClient.on('connect', () => {
            console.log('New client connected to broker');
            newClient.subscribe('retain/topic', (err) => {
                if (err) {
                    reject(err);
                }
            });

            newClient.on('message', (topic, message) => {
                if (topic === 'retain/topic') {
                    console.log("message==>", message.toString());

                    let retainedMessage = message.toString();
                    assert.strictEqual(retainedMessage, 'Retained Message', 'Retained message does not match');
                    newClient.end();
                    resolve();
                }
            });
        });

        newClient.on('error', (err) => {
            console.error('Connection error:', err);
            reject(err);
        });
    });
});

When('I connect to the broker, set a Last Will message, and simulate an unclean disconnection', function () {
    return new Promise((resolve, reject) => {
        client = mqtt.connect(mqttUrl, {
            will: {
                topic: 'will/topic',
                payload: 'Last Will Message',
                qos: 1,
                retain: false
            },
            connectTimeout: 5000,
        });

        client.on('connect', () => {
            console.log('Connected to broker with Last Will message set');
            client.stream.end();
            resolve();
        });

        client.on('error', (err) => {
            console.error('Connection error:', err);
            reject(err);
        });
    });
});

Then('the Last Will message should be published to the specified topic', function () {
    return new Promise((resolve, reject) => {
        const newClient = mqtt.connect(mqttUrl, {
            connectTimeout: 5000,
        });

        newClient.on('connect', () => {
            console.log('New client connected to broker');
            newClient.subscribe('will/topic', (err) => {
                if (err) {
                    reject(err);
                }
            });

            newClient.on('message', (topic, message) => {
                if (topic === 'will/topic') {
                    willMessage = message.toString();
                    assert.strictEqual(willMessage, 'Last Will Message', 'Last Will message does not match');
                    newClient.end();
                    resolve();
                }
            });
        });

        newClient.on('error', (err) => {
            console.error('Connection error:', err);
            reject(err);
        });
    });
});

When('I connect to the broker with the clean session flag set', function () {
    return new Promise((resolve, reject) => {
        client = mqtt.connect(mqttUrl, {
            clean: true,
            connectTimeout: 5000,
        });

        client.on('connect', () => {
            console.log('Connected to broker with clean session');
            resolve();
        });

        client.on('error', (err) => {
            console.error('Connection error:', err);
            reject(err);
        });
    });
});

Then('no previous subscriptions or session state should be retained', function () {
    return new Promise((resolve, reject) => {
        client.subscribe('clean/session/topic', (err) => {
            if (err) {
                reject(err);
            } else {
                client.end(false, {}, () => {
                    const newClient = mqtt.connect(mqttUrl, {
                        clean: true,
                        connectTimeout: 5000,
                    });

                    newClient.on('connect', () => {
                        newClient.subscribe('clean/session/topic', (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("resolve in new client");
                                resolve();
                            }
                        });

                        newClient.on('message', () => {
                            reject(new Error('Unexpected message received'));
                        });

                        setTimeout(() => {
                            newClient.end();
                            resolve();
                        }, 1000);
                    });

                    newClient.on('error', (err) => {
                        console.error('Connection error:', err);
                        reject(err);
                    });
                });
            }
        });
    });
});


