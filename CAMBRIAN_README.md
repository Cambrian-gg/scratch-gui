# Keep it as close as possible to Scratch GUI  

We are forking scratch-gui and we are trying to keep it close to what scratch-gui has in terms of abstractions. 
This is until we get funding for a next step. We don't want to spend time changing things and refactoring and modifying.

# Development

## Install

```bash
nvm use v16.17.1
npm install
```

## Start and configure project host

Modify the projectHost, token and projectId that will be used from the localhost:8601 to communicate with 
a projectHost.

It should know where the backend is. 

The token is issued as an API token from the projectHost. When starting it go to Profile->API Tokens
The projectId is just an id of a project that exists in the local project host.

```jsx
// src/containers/ai-tab.jsx
 	<Deck
	  host={"http://localhost:3030"}
	  token={"Vsv4eVB6bm4123xSpQgngasr"}
	  projectId={"9"}
	/>
```

Then do

```bash
npm start
```

## Deployment

Branch is 'cambrian-mod'

```bash
/bin/bash deploy.sh
```

Note: This deploys whatever is in the current folder and NOT WHAT IS IN THE BRANCH.

## Changelog

We keep a human readable changelong at CAMBRIAN_CHANGELOG.md
This changelog is used for reporting on progress made. It is a more JTBD overview of the different commits
and is not a list of the commits. 

Versions are semantic versions prefixed with 'c'

Example

```
c-0.1.1
c-0.1.0
```

