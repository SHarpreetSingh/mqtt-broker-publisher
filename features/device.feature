Feature: Test LED light on IoT device

  @mqtt
  Scenario: Turn on LED
    Given The device is connected to MQTT broker
  #   When I publish "turn on1" to "device/command"
  #   Then the device should respond with "turn ON"
  # Scenario: Client publishes a message
  #   Given a MQTT client connected to the server

  @mqtt
  Scenario: Connect with valid broker URL and credentials
    Given an MQTT broker is running
    When i connect to the broker with valid URL and credentials
    Then the connection should be established successfully

  @mqtt
  Scenario: Connect with invalid broker URL
    Given an MQTT broker is running
    When i connect to the broker with an invalid URL
    Then the connection should fail with an appropriate error message

  @mqtt
  Scenario: Connect with invalid credentials
    Given an MQTT broker is running
    When i connect to the broker with invalid credentials
    Then the connection should fail with an authentication error

  @mqtt
  Scenario: Connect and disconnect immediately
    Given an MQTT broker is running
    When I connect to the broker and then disconnect
    Then the connection should be established and then disconnected successfully

  @mqtt
  Scenario: Reconnect after network interruption
    Given an MQTT broker is running
    When I connect to the broker and simulate a network interruption
    Then the client should reconnect successfully after the network is restored

  @mqtt
  Scenario: Subscribe to a valid topic
    When I connect to the broker and subscribe to a valid topic
    Then the subscription should be successful

  @mqtt
  Scenario: Subscribe to an invalid topic
    Given an MQTT broker is running
    When I connect to the broker and subscribe to an invalid topic
    Then the subscription should fail with an appropriate error message

  @mqtt
  Scenario: Receive messages on a subscribed topic
    Given an MQTT broker is running
    When I connect to the broker, subscribe to a topic, and publish a message to that topic
    Then the client should receive the published message

  @mqtt
  Scenario: Unsubscribe from a topic
    Given an MQTT broker is running
    When I connect to the broker, subscribe to a topic, and then unsubscribe
    Then the unsubscription should be successful and no more messages should be received on that topic

  Scenario: Resubscribe after reconnecting
    Given an MQTT broker is running
    When I connect to the broker, subscribe to a topic, disconnect, reconnect, and resubscribe
    Then the resubscription should be successful and messages should be received on the topic

  Scenario: Publish to a valid topic
    Given an MQTT broker is running
    When I connect to the broker and publish a message to a valid topic
    Then the message should be published successfully

  Scenario: Publish to an invalid topic
    Given an MQTT broker is running
    When I connect to the broker and publish a message to an invalid topic
    Then the publishing should fail with an appropriate error message

  Scenario: Publish with QoS 0 (At most once)
    Given an MQTT broker is running
    When I connect to the broker and publish a message with QoS 0
    Then the message should be published with no guarantee of delivery

  Scenario: Publish with QoS 1 (At least once)
    Given an MQTT broker is running
    When I connect to the broker and publish a message with QoS 1
    Then the message should be published and acknowledged at least once

  Scenario: Publish with QoS 2 (Exactly once)
    Given an MQTT broker is running
    When I connect to the broker and publish a message with QoS 2
    Then the message should be published exactly once
