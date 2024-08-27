# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Ensured all "Balance Affecting" Transactions are included.
- Allow selecting of transaction types.
- Added option to export all transactions from history
- Added option to group reward transactions. Which will "roll-up" consecutive `claim_reward` transactions between other transaction types to reduce number of lines output.
- Added option to reconcile grouped transactions at the end of each day. Prevents inaccurate cost-base.
- Removed Coingecko price lookup API (broken)
- Removed Koinly support (I am not using the app so unable to test)
- Added a Generic export with Running Totals for an "Account Ledger" type export. Good for debugging.
- Reworked structure to allow for easily adding "handlers" for future exporters. Located under `utils/handlers`
- Changed App to use new HAF-based API endpoints.
