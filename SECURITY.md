# Security policy

OpenInventory signs in to Steam with your account, so security reports are taken seriously.

## Reporting a vulnerability

Please **don't open a public issue**. Use [private vulnerability reporting](https://github.com/8liam/OpenInventory/security/advisories/new) on this repository. Expect an acknowledgement within a few days.

## Supported versions

Only the latest release receives fixes.

## What the app does with your account

- Your Steam refresh token is stored locally in `session.json` in the data directory (mode `0600`) and deleted on **Sign out**.
- OpenInventory never lists or trades items; it only reads your inventory and moves items between your inventory and storage units, each move confirmed by the Game Coordinator.
- No telemetry. Network access is limited to Steam, public item/price data and update checks against GitHub Releases.

See the [Security section of the README](README.md#security) for hardening a self-hosted instance.
