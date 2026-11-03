# GENERATED FILE. Do not edit by hand.
# Source: data/irregular-hours.csv, data/no-irregular-hours.csv
# Regenerate with: npm run bdd:gen

Feature: Holiday entitlement calculator - decision table
  Each row of the decision table is one scenario. The data lives in the CSV files,
  so a change is made once and regenerated rather than copied into the feature.

  Background:
    Given I am on the GOV.UK Holiday Entitlement Calculator start page
    When I click start now

  @irregular-hours @accrual
  Scenario Outline: Irregular hours - pay period accrual
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "Yes"
    When I enter the leave year start date "<leaveYearStart>"
    And I enter the pay period hours "<payPeriodHours>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId | leaveYearStart | payPeriodHours |
      | Test01 | 01/04/2024     | 40             |
      | Test02 | 01/04/2024     | 50             |
      | Test03 | 01/04/2024     | 54.5           |

  @irregular-hours @days-worked
  Scenario Outline: Irregular hours - days worked per week
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "Yes"
    When I enter the leave year start date "<leaveYearStart>"
    And I select working pattern "days worked per week"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId | leaveYearStart | timeframe                                                      | startDate  | endDate    | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | Test04 | 30/03/2024     | for a full leave year                                          | N/A        | N/A        | 5           | N/A    | N/A           | N/A           | N/A         |
      | Test05 | 30/03/2024     | for someone starting part way through a leave year             | 01/06/2024 | N/A        | 5           | N/A    | N/A           | N/A           | N/A         |
      | Test06 | 30/03/2024     | for someone leaving part way through a leave year              | N/A        | 28/02/2025 | 5           | N/A    | N/A           | N/A           | N/A         |
      | Test07 | 30/03/2024     | for someone starting and leaving part way through a leave year | 01/06/2024 | 28/02/2025 | 5           | N/A    | N/A           | N/A           | N/A         |

  @irregular-hours @hours-worked
  Scenario Outline: Irregular hours - hours worked per week
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "Yes"
    When I enter the leave year start date "<leaveYearStart>"
    And I select working pattern "hours worked per week"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId | leaveYearStart | timeframe                                                      | startDate  | endDate    | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | Test08 | 30/03/2024     | for a full leave year                                          | N/A        | N/A        | 5           | 37.5   | N/A           | N/A           | N/A         |
      | Test09 | 30/03/2024     | for someone starting part way through a leave year             | 01/06/2024 | N/A        | 5           | 37.5   | N/A           | N/A           | N/A         |
      | Test10 | 30/03/2024     | for someone leaving part way through a leave year              | N/A        | 28/02/2025 | 5           | 37.5   | N/A           | N/A           | N/A         |
      | Test11 | 30/03/2024     | for someone starting and leaving part way through a leave year | 01/06/2024 | 28/02/2025 | 5           | 37.5   | N/A           | N/A           | N/A         |

  @irregular-hours @annualised-hours
  Scenario Outline: Irregular hours - annualised hours
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "Yes"
    When I enter the leave year start date "<leaveYearStart>"
    And I select working pattern "annualised hours"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId | leaveYearStart | timeframe                                                      | startDate  | endDate    | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | Test12 | 30/03/2024     | for a full leave year                                          | N/A        | N/A        | N/A         | 1600   | N/A           | N/A           | N/A         |
      | Test13 | 30/03/2024     | for someone starting part way through a leave year             | 01/06/2024 | N/A        | N/A         | 1600   | N/A           | N/A           | N/A         |
      | Test14 | 30/03/2024     | for someone leaving part way through a leave year              | N/A        | 28/02/2025 | N/A         | 1600   | N/A           | N/A           | N/A         |
      | Test15 | 30/03/2024     | for someone starting and leaving part way through a leave year | 01/06/2024 | 28/02/2025 | N/A         | 1600   | N/A           | N/A           | N/A         |

  @irregular-hours @compressed-hours
  Scenario Outline: Irregular hours - compressed hours
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "Yes"
    When I enter the leave year start date "<leaveYearStart>"
    And I select working pattern "compressed hours"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId | leaveYearStart | timeframe                                                      | startDate  | endDate    | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | Test16 | 30/03/2024     | for a full leave year                                          | N/A        | N/A        | 5           | 37.5   | N/A           | N/A           | N/A         |
      | Test17 | 30/03/2024     | for someone starting part way through a leave year             | 01/06/2024 | N/A        | 5           | 37.5   | N/A           | N/A           | N/A         |
      | Test18 | 30/03/2024     | for someone leaving part way through a leave year              | N/A        | 28/02/2025 | 5           | 37.5   | N/A           | N/A           | N/A         |
      | Test19 | 30/03/2024     | for someone starting and leaving part way through a leave year | 01/06/2024 | 28/02/2025 | 5           | 37.5   | N/A           | N/A           | N/A         |

  @irregular-hours @shifts
  Scenario Outline: Irregular hours - shifts
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "Yes"
    When I enter the leave year start date "<leaveYearStart>"
    And I select working pattern "shifts"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId | leaveYearStart | timeframe                                                      | startDate  | endDate    | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | Test20 | 30/03/2024     | for a full leave year                                          | N/A        | N/A        | N/A         | N/A    | 12            | 4             | 8           |
      | Test21 | 30/03/2024     | for someone starting part way through a leave year             | 01/06/2024 | N/A        | N/A         | N/A    | 12            | 4             | 8           |
      | Test22 | 30/03/2024     | for someone leaving part way through a leave year              | N/A        | 28/02/2025 | N/A         | N/A    | 12            | 4             | 8           |
      | Test23 | 30/03/2024     | for someone starting and leaving part way through a leave year | 01/06/2024 | 28/02/2025 | N/A         | N/A    | 12            | 4             | 8           |

  @no-irregular-hours @days-worked
  Scenario Outline: No irregular hours - days worked per week
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "No"
    And I select working pattern "days worked per week"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter the leave year start date "<leaveYearStart>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId    | timeframe                                                      | startDate  | endDate    | leaveYearStart | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | NoDays-01 | for a full leave year                                          | N/A        | N/A        | N/A            | 5           | N/A    | N/A           | N/A           | N/A         |
      | NoDays-02 | for a full leave year                                          | N/A        | N/A        | N/A            | 3.5         | N/A    | N/A           | N/A           | N/A         |
      | NoDays-03 | for a full leave year                                          | N/A        | N/A        | N/A            | 7           | N/A    | N/A           | N/A           | N/A         |
      | NoDays-04 | for someone starting part way through a leave year             | 01/04/2026 | N/A        | 30/03/2026     | 5           | N/A    | N/A           | N/A           | N/A         |
      | NoDays-05 | for someone leaving part way through a leave year              | N/A        | 30/09/2026 | 30/03/2026     | 5           | N/A    | N/A           | N/A           | N/A         |
      | NoDays-06 | for someone starting and leaving part way through a leave year | 01/03/2026 | 31/10/2026 | N/A            | 4           | N/A    | N/A           | N/A           | N/A         |

  @no-irregular-hours @hours-worked
  Scenario Outline: No irregular hours - hours worked per week
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "No"
    And I select working pattern "hours worked per week"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter the leave year start date "<leaveYearStart>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId     | timeframe                                                      | startDate  | endDate    | leaveYearStart | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | NoHours-01 | for a full leave year                                          | N/A        | N/A        | N/A            | 5           | 37.5   | N/A           | N/A           | N/A         |
      | NoHours-02 | for a full leave year                                          | N/A        | N/A        | N/A            | 4           | 20.0   | N/A           | N/A           | N/A         |
      | NoHours-03 | for someone starting part way through a leave year             | 01/05/2026 | N/A        | 30/03/2026     | 5           | 37.5   | N/A           | N/A           | N/A         |
      | NoHours-04 | for someone leaving part way through a leave year              | N/A        | 31/08/2026 | 30/03/2026     | 5           | 37.5   | N/A           | N/A           | N/A         |
      | NoHours-05 | for someone starting and leaving part way through a leave year | 01/02/2026 | 30/11/2026 | N/A            | 4           | 30.0   | N/A           | N/A           | N/A         |

  @no-irregular-hours @shifts
  Scenario Outline: No irregular hours - shifts
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "No"
    And I select working pattern "shifts"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter the leave year start date "<leaveYearStart>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId      | timeframe                                                      | startDate  | endDate    | leaveYearStart | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | NoShifts-01 | for a full leave year                                          | N/A        | N/A        | N/A            | N/A         | N/A    | 12            | 4             | 8           |
      | NoShifts-02 | for a full leave year                                          | N/A        | N/A        | N/A            | N/A         | N/A    | 8             | 5             | 7           |
      | NoShifts-03 | for someone starting part way through a leave year             | 01/04/2026 | N/A        | 30/03/2026     | N/A         | N/A    | 12            | 4             | 8           |
      | NoShifts-04 | for someone leaving part way through a leave year              | N/A        | 30/09/2026 | 30/03/2026     | N/A         | N/A    | 10            | 4             | 7           |
      | NoShifts-05 | for someone starting and leaving part way through a leave year | 01/03/2026 | 31/10/2026 | N/A            | N/A         | N/A    | 10            | 4             | 7           |

  @no-irregular-hours @annualised-hours
  Scenario Outline: No irregular hours - annualised hours
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "No"
    And I select working pattern "annualised hours"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter the leave year start date "<leaveYearStart>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId          | timeframe             | startDate | endDate | leaveYearStart | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | NoAnnualised-01 | for a full leave year | N/A       | N/A     | N/A            | N/A         | 1600   | N/A           | N/A           | N/A         |

  @no-irregular-hours @compressed-hours
  Scenario Outline: No irregular hours - compressed hours
    Given I am testing case "<testId>"
    And I answer the irregular hours question with "No"
    And I select working pattern "compressed hours"
    And I select leave timeframe "<timeframe>"
    And I enter the start date "<startDate>" and the end date "<endDate>"
    And I enter the leave year start date "<leaveYearStart>"
    And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"
    Then the answers entered should be shown
    And the expected result is calculated from the answers

    Examples:
      | testId          | timeframe             | startDate | endDate | leaveYearStart | daysPerWeek | amount | shiftDuration | shiftsInCycle | daysInCycle |
      | NoCompressed-01 | for a full leave year | N/A       | N/A     | N/A            | 5           | 37.5   | N/A           | N/A           | N/A         |
