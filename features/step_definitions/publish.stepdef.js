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

When('I connect to the broker and publish a message to a valid topic', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      client.publish('valid/topic', 'hey mesg publish', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log("onnect to the broker and publish a message to a valid topic");
          resolve();
        }
      });
    });
    client.on('error', reject);
  });
});

Then('the message should be published successfully', function () {
  console.log("client.connected", client.connected);
  assert(client.connected, 'Client is not connected');
  client.end();
});

When('I connect to the broker and publish a message to an invalid topic', function () {
  const world = this
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      client.publish('#invalid/topic', 'Hello i"m publish a message to an invalid topic', (err) => {
        console.log(err,"err")
        if (err) {
          world.error = err;
          reject();
        } else {
          resolve('Expected publishing error');
        }
      });
    });
    client.on('error', reject);
  });
});

Then('the publishing should fail with an appropriate error message', function () {
  const world = this
  assert(world.error, 'Expected publishing error');
});

When('I connect to the broker and publish a message with QoS 0', function () {
  return new Promise((resolve, reject) => {
      client = mqtt.connect(mqttUrl, {
          // Provide the necessary options, ensure no username or password is set
          connectTimeout: 5000,
      });

      client.on('connect', () => {
          console.log('Connected to broker');
          client.publish('valid/topic', 'Hello MQTT QoS 0', { qos: 0 }, (err) => {
              if (err) {
                  reject(err);
              } else {
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

Then('the message should be published with no guarantee of delivery', function () {
  assert(client.connected, 'Client is not connected');
});

When('I connect to the broker and publish a message with QoS 1', function () {
  return new Promise((resolve, reject) => {
      client = mqtt.connect(mqttUrl, {
          connectTimeout: 5000,
      });

      client.on('connect', () => {
          console.log('Connected to broker');
          client.publish('my/topic', 'Hello MQTT QoS 1', { qos: 1 }, (err) => {
              if (err) {
                  reject(err);
              } else {
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

Then('the message should be published and acknowledged at least once', function () {
  assert(client.connected, 'Client is not connected');
});

When('I connect to the broker and publish a message with QoS 2', function () {
  return new Promise((resolve, reject) => {
      client = mqtt.connect(mqttUrl, {
          connectTimeout: 5000,
      });

      client.on('connect', () => {
          console.log('Connected to broker');
          client.publish('valid/topic', 'Hello MQTT QoS 2', { qos: 2 }, (err) => {
              if (err) {
                  reject(err);
              } else {
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

Then('the message should be published exactly once', function () {
  assert(client.connected, 'Client is not connected');
});
