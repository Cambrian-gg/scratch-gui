# Keep it as close as possible to Scratch GUI

We are forking scratch-gui and we are trying to keep it close to what scratch-gui has in terms of abstractions.
This is until we get funding for a next step. We don't want to spend time changing things and refactoring and modifying.

# Development

## Start and configure project host

Modify the projectHost and decksHost in the render-gui. They will be used from the localhost:8601 to communicate with
the platform

It should know where the backend is.

The token is issued as an API token from the platform. When starting the Platform go to Profile->API Tokens

```jsx
// src/playground/render-gui.jsx
   <WrappedGui
       canEditTitle
       backpackVisible
       showComingSoon
       backpackHost={backpackHost}
       canSave={true}
       canCreateNew={true}
       projectToken={urlParams.token}
       projectHost={projectHost || "http://localhost:3030/scratch/projects"}
       decksHost={deckHost || "http://localhost:3030/scratch"}
       assetHost={assetHost || "http://localhost:3030/scratch/assets"}
       // projectHost={"https://cambrian-gg.herokuapp.com/scratch/projects"}
       // decksHost={"https://cambrian-gg.herokuapp.com/scratch"}
       // assetHost={"https://cambrian-gg.herokuapp.com/scratch/assets"}
       onClickLogo={onClickLogo}
```


## Cambrian Development

### Enable project_host and asset_host params in the url

1. Edit src/playground/render-gui.jsx to be

```
--- a/src/playground/render-gui.jsx
+++ b/src/playground/render-gui.jsx
@@ -94,12 +94,12 @@ export default appTarget => {
                 canSave={true}
                 canCreateNew={true}
                 projectToken={urlParams.token}
-                // projectHost={projectHost || "http://localhost:3030/scratch/games"}
-                // decksHost={deckHost || "http://localhost:3030/scratch"}
-                // assetHost={assetHost || "http://localhost:3030/scratch/assets"}
-                projectHost={"https://app.cambrian.gg/scratch/games"}
-                decksHost={"https://app.cambrian.gg/scratch"}
-                assetHost={"https://app.cambrian.gg/scratch/assets"}
+                projectHost={projectHost || "http://localhost:3030/scratch/games"}
+                decksHost={deckHost || "http://localhost:3030/scratch"}
+                assetHost={assetHost || "http://localhost:3030/scratch/assets"}
+                // projectHost={"https://app.cambrian.gg/scratch/games"}
+                // decksHost={"https://app.cambrian.gg/scratch"}
+                // assetHost={"https://app.cambrian.gg/scratch/assets"}
```

2. Edit src/playground/player.jsx to be
```
--- a/src/playground/player.jsx
+++ b/src/playground/player.jsx
@@ -72,10 +72,10 @@ document.body.appendChild(appTarget);
 ReactDOM.render(<WrappedPlayer
                   isPlayerOnly
                   // TODO: Extract the project, asset and deck hosts to a component
-                  // projectHost={"http://localhost:3030/scratch/games"}
-                  // decksHost={"http://localhost:3030/scratch"}
-                  // assetHost={"http://localhost:3030/scratch/assets"}
-                  projectHost={"https://app.cambrian.gg/scratch/games"}
-                  decksHost={"https://app.cambrian.gg/scratch"}
-                  assetHost={"https://app.cambrian.gg/scratch/assets"}
+                  projectHost={"http://localhost:3030/scratch/games"}
+                  decksHost={"http://localhost:3030/scratch"}
+                  assetHost={"http://localhost:3030/scratch/assets"}
+                  // projectHost={"https://app.cambrian.gg/scratch/games"}
+                  // decksHost={"https://app.cambrian.gg/scratch"}
+                  // assetHost={"https://app.cambrian.gg/scratch/assets"}
```

3. Edit src/cable.js to be

```
--- a/src/cable.js
+++ b/src/cable.js
@@ -3,8 +3,8 @@ import { createConsumer } from '@rails/actioncable';
 const searchParams = new URLSearchParams(window.location.href);
 const cableHost = searchParams.get('cable_host');

-// const URL = cableHost || 'ws://localhost:3030/cable';
-const URL = 'wss://app.cambrian.gg/cable'
+const URL = cableHost || 'ws://localhost:3030/cable';
+// const URL = 'wss://app.cambrian.gg/cable'
```


Then do

```bash
nvm use v16.17.1
npm start
```

Then go to [http://localhost:8601/?token=XXX](http://localhost:8601/) - the playground outputs the default GUI component

XXX is the token that is issued by the platform.

## Deployment

Branch is 'cambrian-mod'

```bash
/bin/bash deploy.sh
```

Note: This deploys whatever is in the current folder and NOT WHAT IS IN THE BRANCH.

## Changelog

We keep a human readable changelog at CAMBRIAN_CHANGELOG.md
This changelog is used for reporting on progress made. It is a more JTBD overview of the different commits
and is not a list of the commits.

Versions are semantic versions prefixed with 'c'

Example

```
c-0.1.1
c-0.1.0
```

## Common errors

### NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope':

```
NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://cambrian.axlessoft.com/cambrianDecks' failed to load.
```

This occurs when

1. The cambrian extensions cannot be loaded. The repos for scratch-vm and scratch-gui should be linked. Check https://github.com/LLK/scratch-gui/wiki/Getting-Started
