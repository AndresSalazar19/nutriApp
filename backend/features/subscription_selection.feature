Feature: Subscription plan selection
  As a patient
  I want to select a subscription plan during onboarding
  So that my account reflects the plan I chose, correctly mapped to the billing enum

  Background:
    Given a patient is registered and authenticated

  Scenario Outline: Selecting a visual plan maps to the correct billing enum value
    When the patient subscribes to the "<visual_plan>" plan
    Then the subscription is created successfully
    And the stored plan value is "<billing_plan>"
    And the subscription status is "active"

    Examples: Visual catalog to billing enum mapping
      | visual_plan | billing_plan |
      | basic       | free         |
      | standard    | basic        |
      | premium     | premium      |

  Scenario: Changing plan updates the existing subscription instead of creating a duplicate
    Given the patient already subscribed to the "basic" plan
    When the patient subscribes to the "premium" plan
    Then the patient has exactly one subscription record
    And the stored plan value is "premium"
