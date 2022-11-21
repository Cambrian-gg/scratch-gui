#!/bin/bash

npm run build
rsync -avzh  -e 'ssh -i ~/.ssh/id_rsa_acer -p 1022' ./build/* robopart@sega.superhosting.bg:/home/robopart/cambrian.axlessoft.com/ --delete
