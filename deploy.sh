#!/bin/bash

# Don't forget to link the vm
# Otherwise the deployed version will use the standard scratch-vm without the extensions
# git status also does not show if the n
npm link scratch-vm

npm run build
rsync -avzh  -e 'ssh -p 1022' ./build/* robopart@sega.superhosting.bg:/home/robopart/cambrian.axlessoft.com/ --delete
