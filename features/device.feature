Feature: Test LED light on IoT device

  Scenario: Turn on LED
    Given The device is connected to MQTT broker
    When I publish "turn on" to "device/command"
    Then the device should respond with "turn ON"

