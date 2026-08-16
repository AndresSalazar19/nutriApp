Feature: Patient-nutritionist assignment visibility
  As a patient
  I want to see my assigned nutritionist's name and specialty
  So that I know who is guiding my treatment before contacting them

  Background:
    Given a seeded nutritionist exists
    And a patient is registered and authenticated

  Scenario: A patient with no assigned nutritionist sees no assignment
    When the patient requests their assigned nutritionist
    Then no nutritionist is returned

  Scenario: A patient with an assigned nutritionist sees the name and specialty
    Given the patient is assigned to the seeded nutritionist
    When the patient requests their assigned nutritionist
    Then a nutritionist is returned
    And the returned nutritionist has a first and last name
    And the returned specialty matches the seeded nutritionist's specialty
