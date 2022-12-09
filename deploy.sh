#!/bin/bash

npm run build
rsync -avzh  -e 'ssh -p 1022' ./build/* robopart@sega.superhosting.bg:/home/robopart/cambrian.axlessoft.com/ --delete
