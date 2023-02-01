#!/bin/bash

# Don't forget to link the vm
# Otherwise the deployed version will use the standard scratch-vm without the extensions
# git status also does not show if the n
npm link scratch-vm

# npm sometimes does not produce a new file when linking unlinked was done.
# This brakes us. We need to do it. That's why we generate
# a new version on every deploy - just the next one and include it in the final
# file. In this way the final file is new and the hash is new and hew
# files are delivered from the server
# npm version prerelease --preid=cambrian # --no-git-tag-version

npm run build
rsync -avzh  -e 'ssh -p 1022' ./build/* robopart@sega.superhosting.bg:/home/robopart/code.cambrian.gg/ --delete
