const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const mqtt = require('mqtt');
const dotenv = require('dotenv');
const assert = require('assert');
const { setTimeout } = require('timers/promises');

setDefaultTimeout(15000)
dotenv.config();
// let client;
let receivedMessage;
const mqttUrl = process.env.MQTT_URL

Given('The device is connected to MQTT broker', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);

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
      receivedMessage = message.toString();
      console.log("topic", topic, "receivedMessage", receivedMessage);
      if (receivedMessage === expectedResponse) {
        resolve();
      } else {
        reject(new Error(`Expected "${expectedResponse}" but got "${receivedMessage}"`));
      }
    });
  })
});

Then('an MQTT broker is running', { timeout: 1 * 60 * 1000 }, function () {
  console.log("running");
})


When('i connect to the broker with valid URL and credentials', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl, {
      username: 'Harp321', //Tech321
      password: 'Harp@321' // Tech@321
    });
    client.on('connect', () => {
      console.log("mqtt connect");
      resolve()
    });
    client.on('error', (err) => {
      console.log("err", err);
      reject(err)
    });

  })
});

Then('the connection should be established successfully', async function () {
  console.log("client.connected");
  return new Promise(async (resolve, reject) => {
    if (!await client.connected) {
      reject('Connection not established');
    }
    console.log("mqtt before disconnected");
    client.end();
    console.log("mqtt After disconnected");
    resolve()
  })
});

When('i connect to the broker with an invalid URL', function () {
  client = mqtt.connect('mqtt://invalid-url:1883');
  client.on('error', (err) => {
    this.error = err;
  });
});

Then('the connection should fail with an appropriate error message', function () {
  return new Promise(async (resolve, reject) => {
    if (!this.error) {
      resolve(`Expected connection error ${this.error}`);
    }
    reject()
  })
});

When('i connect to the broker with invalid credentials', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl, {
      username: 'invalidUser',
      password: 'invalidPassword'
    });
    client.on('error', (err) => {
      this.error = err;
      reject(this.error)
    });
    resolve()
  });
});

Then('the connection should fail with an authentication error', function () {
  return new Promise((resolve, reject) => {
    if (!this.error) {
      resolve('Expected authentication error');
    }
    reject()
  });
});


When('I connect to the broker and then disconnect', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      client.end();
      resolve()
    });
    client.on('error', (err) => {
      console.log("err", err);
      reject(err);
    });
  });
});

Then('the connection should be established and then disconnected successfully', function () {
  return new Promise((resolve, reject) => {
    if (!client.disconnected) {
      resolve('Client not disconnected successfully');
    }
    reject()
  });
});

When('I connect to the broker and simulate a network interruption', { timeout: 20 * 1000 }, function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', (res) => {
      console.log("stream connect", //res
      )

      id = setTimeout(() => {
        console.log("stream.end ===")
        client.stream.end();  // Simulate network interruption
        clearInterval(id)
      }, 4000);
      reconnectAfterIntervalId = setInterval(() => {
        client.reconnect();  // Reconnect after interruption
        console.log("reconnect()")
        clearInterval(reconnectAfterIntervalId)
      }, 6000);
    });
    client.on('reconnect', () => {
      console.log("reconnect")
      client.end();
      resolve()
    });
    client.on('error', (err) => {
      console.log("err", err)
      reject(err);
    });
  });
});

Then('the client should reconnect successfully after the network is restored', function () {
  return new Promise((resolve, reject) => {
    if (!client.connected) {
      reject('Client not reconnected successfully');
    }
    console.log("before end")
    client.end();
    console.log("after end")
    resolve()
  })
});

When('I connect to the broker and subscribe to a valid topic', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      client.subscribe('device/response', (err) => {
        if (err) {
          reject("err", err);
        } else {
          console.log("subscribe to a valid topic");
          resolve()
        }
      });
    });
  })
})

Then('the subscription should be successful', function () {
  return new Promise((resolve, reject) => {
    if (!client.connected) {
      throw new Error('Subscription not successful');
    }
    client.end();
    console.log("subscription should be successful");
    resolve()
  });
});

When('I connect to the broker and subscribe to an invalid topic', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      // console.log("connect successful");
      client.subscribe('#invalid/topic', (err) => {
        if (err) {
          console.log("Expected subscription errors");
          assert.ok(true)
          resolve()
        } else {
          assert.fail()
        }
      });
    });
  });
});

Then('the subscription should fail with an appropriate error message', function () {
  if (!this.error) {
    console.log("subscription should be fail");
  }
  // throw new Error('Expected subscription error');
});

let receivedMessages = [];

When('I connect to the broker, subscribe to a topic, and publish a message to that topic', function () {
  return new Promise((resolve, reject) => {

    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      client.subscribe('test/topic1', (err) => {
        if (err) {
          console.log("err", err);
        } else {
          client.publish('test/topic1', 'Hello MQTT', { qos: 1 });
        }
      });
    });

    client.on('message', (topic, message) => {
      receivedMessages.push(message.toString());
      console.log(receivedMessages);
      resolve()
    });
  });
});

Then('the client should receive the published message', function () {
  if (!receivedMessages.includes('Hello MQTT')) {
    throw new Error('Expected message not received');
  }
  client.end();
});

When('I connect to the broker, subscribe to a topic, and then unsubscribe', function () {
  // console.log(this.client);
  const client = this.client
  return new Promise((resolve, reject) => {
    client.subscribe('test/topic', (err) => {
      if (err) {
        console.log("eerr", err);
        reject(err)
      } else {
        client.unsubscribe('test/topic', (err) => {
          if (err) {
            console.log("erorr", err);
            reject(err)
          } else {
            console.log("unsubscribe");
            resolve()
          }
        });
      }
    });
  });
});

Then('the unsubscription should be successful and no more messages should be received on that topic', function () {
  const client = this.client

  return new Promise((resolve, reject) => {
    client.on('message', (topic, message) => {
      console.log("receivedMessages", message);
      receivedMessages.push(message.toString());
    });

    client.publish('test/topic', 'Hello MQTT', { qos: 1 }, () => {
      console.log("client.publish");
      intervalIdForUnsubscription = setInterval(() => {
        // setTimeOut is not working
        console.log("setInterval");
        if (receivedMessages.includes('Hello MQTT')) {
          console.log("Unexpected message received after unsubscription");
          reject("Unexpected message received after unsubscription")
        } else {
          console.log("resolve");
          resolve()
        }
        clearInterval(intervalIdForUnsubscription)
      }, 4000);
    });
  });
})

When('I connect to the broker, subscribe to a topic, disconnect, reconnect, and resubscribe', function () {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(mqttUrl);
    client.on('connect', () => {
      client.subscribe('test/topic', (err) => {
        if (err) {
          console.log("err", err);
          reject()
        } else {
          client.end(true, () => {
            client = mqtt.connect(mqttUrl);
            client.on('connect', () => {
              client.subscribe('test/topic', (err) => {
                if (err) {
                  console.log("err", err);
                  reject()
                } else {
                  console.log("reconnect, and resubscribe");
                  resolve()
                }
              });
            });
          });
        }
      });
    });
  });
});

Then('the resubscription should be successful and messages should be received on the topic', function () {
  let id
  return new Promise((resolve, reject) => {

    client.on('message', (topic, message) => {
      receivedMessages.push(message.toString());
      console.log("receivedMessages", message.toString());
    });

    client.publish('test/topic', 'Hello MQTT Again', { qos: 1 }, () => {
      console.log("test/topic");
      id = setInterval(() => {
        console.log("reconnect, setInterval");
        clearInterval(id)

        if (!receivedMessages.includes('Hello MQTT Again')) {
          reject('Expected message not received after resubscription');
        } else {
          console.log("else");
          resolve();
        }
      }, 4000);
    });
  });
});


