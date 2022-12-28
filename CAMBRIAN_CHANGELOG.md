# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
We append versions with "c" as these are CAMBRIAN versions

# Types of changes

Added for new features.
Changed for changes in existing functionality.
Deprecated for soon-to-be removed features.
Removed for now removed features.
Fixed for any bug fixes.
Security in case of vulnerabilities.

## [Unreleased]

### Added

future 0.4.3 version as I want to sync the versions and for this to be 0.4 as the milestones we are discussing with Jonny

- CambrianHOC that helps us communicate between the editor and the extension. In the extension we have access only to the runtime. We put an object runtime.cambrian and in it we store the projectId and the decksHost that we need for the load project block in the extension
- Keeping the costumes in sync with the cards, when cards are added, removed and refreshed from the server.
- Adding the autocomplete all button

## [c-0.4.2] 2022-12-16

### Changed

	- The table how has a scroll
	- The checkbox for generating images is on the same line
	- The image has max-height

## [c-0.4.1] 2022-12-16

### Fixed

	- Save the costumes on the assets server

## [c-0.4.0] 2022-12-15

### Added

	- Added the ability to create a costume from the card

## [c-0.3.0] 2022-12-13

### Added

	- Added the ability to visualize the image that was generated and to ask for a new image to be generated

## [c-0.2.1] 2022-12-13

### Fix

	- Wrong naming for the dispatch of unset

## [c-0.2.0] 2022-12-13

### Added

	- Reducers for storing if we the shouldGenerateImages checkbox is selected or not. This reducer could be used for the whole decks state

## [c-0.1.0] 2022-12-06

### Added

	- Deck tabs gets AI values for the categories from the server and adds it to the name
	- There is an Autocomplete button for cards to get autocompleted.