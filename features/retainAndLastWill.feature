Feature: MQTT Retain and Last Will Tests

  Scenario: Publish with retain flag
    Given an MQTT broker is running
    When I connect to the broker, publish a message with the retain flag set, and disconnect
    Then the retained message should be received by clients subscribing to the topic after the message is published

  Scenario: Set and trigger Last Will message
    Given an MQTT broker is running
    When I connect to the broker, set a Last Will message, and simulate an unclean disconnection
    Then the Last Will message should be published to the specified topic

Scenario: Connect with clean session flag set
    Given an MQTT broker is running
    When I connect to the broker with the clean session flag set
    Then no previous subscriptions or session state should be retained

  Scenario: Connect without clean session flag
    Given an MQTT broker is running
    When I connect to the broker without the clean session flag
    Then previous session state and subscriptions should be retained