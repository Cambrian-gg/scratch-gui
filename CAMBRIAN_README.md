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
        // projectHost={"http://localhost:3030/scratch/projects"}
        projectHost={"https://cambrian-gg.herokuapp.com/scratch/projects"}
        // decksHost={"http://localhost:3030/scratch"}
        decksHost={"https://cambrian-gg.herokuapp.com/scratch"}
        // assetHost={"http://localhost:3030/scratch/assets"}
        // assetHost={"https://cambrian-gg.herokuapp.com/scratch/assets"}
        onClickLogo={onClickLogo}
    />
```

Then do

```bash
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

