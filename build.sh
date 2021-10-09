#!/usr/bin/env bash
rm -r dist/
npm i
./node_modules/.bin/tsc
cp -r public dist/
cp -r views dist/
