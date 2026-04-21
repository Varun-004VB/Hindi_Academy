# Manpower Section Backend Payload Specification

This document details the data structure required to sync the current Manpower Management system with a backend database. The payload is organized by the core entities used in the application.

## 1. Engineers & Contractors (`engineers`)
Represents the primary entities responsible for sites.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the engineer/contractor. |
| `name` | String | Display name. |
| `type` | String | Either `"Engineer"` or `"Contractor"`. |

## 2. Sites (`sites`)
Locations mapped to an engineer/contractor.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the site. |
| `engineerId` | String | Reference to the Engineer's ID. |
| `name` | String | Name of the construction site. |
| `fullAmount` | Number | Total contract value for this site (e.g., ₹50,000 for a week). |

## 3. Workers (`workers`)
Staff members assigned to specific sites.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the worker. |
| `siteId` | String | Reference to the Site's ID. |
| `name` | String | Worker's name. |
| `category` | String | `"Mason"` or `"Helper"`. |
| `wagePerDuty` | Number | **Base Rate** used for contract calculation. |
| `payoutRate` | Number | **Payout Rate** used for weekly settlement (Decoupled). |

## 4. Duties (`duties`)
Historical daily attendance/duty records.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the duty record. |
| `workerId` | String | Reference to the Worker's ID. |
| [date](file:///c:/Users/kumar/OneDrive/Documents/final%20%282%29/final/HindiAcademy-main/src/components/admin/AdvanceTab.tsx#36-39) | String | ISO Date (YYYY-MM-DD). |
| `dutyValue` | Number | Amount of duty (e.g., 0.5, 1, 1.5). |

## 5. Advances (`advances`)
Temporary loans or advances given to workers.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the advance. |
| [date](file:///c:/Users/kumar/OneDrive/Documents/final%20%282%29/final/HindiAcademy-main/src/components/admin/AdvanceTab.tsx#36-39) | String | ISO Date (YYYY-MM-DD). |
| `workerId` | String | Reference to the Worker's ID. |
| `siteId` | String | Reference to the Site's ID. |
| `amount` | Number | Amount given as advance. |
| `remarks` | String | Optional notes/remarks for the advance. |

## 6. Expenses (`expenses`)
Direct costs recorded for a project.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the expense. |
| [date](file:///c:/Users/kumar/OneDrive/Documents/final%20%282%29/final/HindiAcademy-main/src/components/admin/AdvanceTab.tsx#36-39) | String | ISO Date (YYYY-MM-DD). |
| `expenseType` | String | Category (e.g., "Materials", "Transport"). |
| `amount` | Number | Amount spent. |
| `remarks` | String | Detailed description of the spend. |
| `siteId` | String | Reference to the Site's ID. |

## 7. Transactions (`transactions`)
The final ledger for inflow (Received) and outflow (Paid).
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique UUID for the transaction. |
| `type` | String | `"Received"` (from Engineer) or `"Paid"` (to Worker). |
| [date](file:///c:/Users/kumar/OneDrive/Documents/final%20%282%29/final/HindiAcademy-main/src/components/admin/AdvanceTab.tsx#36-39) | String | ISO Date (YYYY-MM-DD). |
| `engineerId` | String | Reference to the Engineer's ID. |
| `siteId` | String | Reference to the Site's ID. |
| `fullAmount` | Number | Expected amount (for Received type). |
| `totalAmount` | Number | **Total Earnings** before advance (for Paid type). |
| `advanceAmount` | Number | **Advance Deducted** during payout (for Paid type). |
| `paidAmount` | Number | **Actual Amount** transferred/paid. |
| `balanceAmount` | Number | Remaining balance (for Received type). |
| `workerId` | String | Reference to the Worker's ID (for Paid type). |

## 8. Global State
| Field | Type | Description |
| :--- | :--- | :--- |
| `cashInHand` | Number | Declared physical cash available. |
| `cashInBank` | Number | Declared bank balance available. |

---

### Sample Consolidated JSON Template
```json
{
  "engineers": [],
  "sites": [],
  "workers": [],
  "duties": [],
  "advances": [],
  "expenses": [],
  "transactions": [],
  "globalStatus": {
    "cashInHand": 0,
    "cashInBank": 0
  }
}
```
