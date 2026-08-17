Feature: Patient registration with duplicate validation
  As the platform
  I want to prevent duplicate cedula, email or phone during registration
  So that no patient can create more than one account with the same identity data

  Background:
    Given a patient is already registered with unique identity data

  Scenario: Registering with an email that is already in use
    When a new patient attempts to register reusing the existing email
    Then the registration is rejected with field "email"

  Scenario: Registering with a cedula that is already in use
    When a new patient attempts to register reusing the existing cedula
    Then the registration is rejected with field "identification"

  Scenario: Registering with a phone that is already in use
    When a new patient attempts to register reusing the existing phone
    Then the registration is rejected with field "phone"

  Scenario: Registering with fully unique data succeeds and starts a session
    When a new patient attempts to register with entirely new identity data
    Then the registration succeeds
    And the response includes an access token
