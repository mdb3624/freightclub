# Phase 1 — Core Load Lifecycle ✅ Complete

The minimum viable loop: a shipper posts a load, a trucker claims and delivers it. Includes financial intelligence tools so truckers can evaluate profitability before committing to a load.

## Core Lifecycle

| Feature | Area |
|---------|------|
| Auth: register, login, JWT refresh | Platform |
| Multi-tenant company system with join code | Platform |
| Shipper: create, edit, cancel, publish loads | Shipper |
| Trucker: browse and filter load board | Trucker |
| Trucker: claim, mark pickup, mark delivered | Trucker |
| Load dimensions (L×W×H), pay rate, payment terms | Both |
| Draft → publish flow | Shipper |
| Shipper and trucker contact info reveal after claim | Both |
| Shipper dashboard (all loads + statuses) | Shipper |
| Trucker dashboard (active load + history + load board tabs) | Trucker |
| Trucker and shipper profiles | Both |

## Financial Intelligence (Trucker)

| Feature | Area |
|---------|------|
| Cost profile: fixed costs, fuel $/gal, MPG, maintenance $/mi, monthly target miles, target margin | Trucker |
| Cost Per Mile (CPM) calculator: fixed CPM, variable CPM, total CPM — live on profile | Trucker |
| Minimum RPM = total CPM + target margin; visible on profile | Trucker |
| RPM column on load board with color-coded profitability badge (green / yellow / red) | Trucker |
| Per-load profitability breakdown: revenue, fuel cost, maintenance, net profit, RPM vs min RPM | Trucker |
| 30-day earnings summary: loads completed, total miles, total revenue, effective CPM | Trucker |
| Hours of Service (HOS) widget: 11-hr drive and 14-hr on-duty progress bars with color warnings | Trucker |
