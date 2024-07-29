const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const mqtt = require('mqtt');
const assert = require('assert');

setDefaultTimeout(15000)
let client;
let receivedMessage;

Given('The device is connected to MQTT broker', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect('mqtt://broker.hivemq.com');

    client.on('connect', function () {
      console.log('Connected to MQTT broker');
      resolve();
    });

    client.on('error', function (err) {
      console.error('Connection error: ', err);
      reject(err);
    });
  });
});

When('I publish {string} to {string}', { timeout: 15000 }, function (message, topic) {
  client.publish(topic, message);
});

Then('the device should respond with {string}', { timeout: 1 * 60 * 1000 }, function (expectedResponse) {
  client.subscribe('device/response');

  return new Promise((resolve, reject) => {
    client.on('message', function (topic, message) {
      console.log("topic", topic, "message", message);
      receivedMessage = message.toString();
      if (receivedMessage === expectedResponse) {
        resolve();
      } else {
        reject(new Error(`Expected "${expectedResponse}" but got "${receivedMessage}"`));
      }
    });
  });
});
