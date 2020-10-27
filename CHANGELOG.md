# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][]

- Version bump

## [2.2.2][] - 2020-10-27

### Fixed
- `!last session` crash when unable to retrieve information on a new achievement

## [2.2.1][] - 2019-10-13

### Fixed
- Catch any errors on bot startup
- Handling of quick disconnect/reconnect in session data

## [2.2.0][] - 2019-10-11

### Added
- GraphQL schema for wvw_score feature
- GraphQL schema for bot guild
- GraphQL schema for session

### Fixed
- `!whois` response when target is not registered
- Will now respond with a no key message on the `!last session` command if the user is not registered

## [2.1.2][] - 2019-10-05

### Fixed
- Properly close database connections when bot stops
- Fix exit signal handlers

## [2.1.1][] - 2019-10-05

### Fixed
- Properly logout of discord when bot stops

## [2.1.0][] - 2019-10-04

### Added
- Version number to !help response
- GraphQL server

### Fixed
- Deprecation warnings from discord.js

## [2.0.0][] - 2019-09-30

### Changed
- Store keys in sqlite instead of redis


[Unreleased]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.2.2...HEAD
[2.2.2]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.1.2...v2.2.0
[2.1.2]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/Nabrok/gw2-discord-bot/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Nabrok/gw2-discord-bot/tree/v2.0.0
