rm -dr ./build
./node_modules/.bin/babel public -d build
./node_modules/.bin/browserify build/main.js -o public/bundle.js
node index.js
