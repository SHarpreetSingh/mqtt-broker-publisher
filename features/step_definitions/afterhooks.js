const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const assert = require('assert');

let client;
const mqttUrl = process.env.MQTT_URL

After({ tags: '@mqtt', name: 'Connect to client' }, function () {
    // Disconnect client after each scenario
    if (this.client) {
        console.log("in after hooks client end");
        this.client.end();
    }
});