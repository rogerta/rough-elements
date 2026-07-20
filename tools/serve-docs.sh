#!/bin/bash

# Run cem analyze once before starting 11ty since it imports the data
# in eleventy config.  This dependency is needed to properly determine class
# hierarchies.  A better fix could be looked into since this it could affect
# documentation writing.
npm run docs:cem

eleventy --serve &
cem analyze --dev --litelement --watch --outdir=./dist --quiet > /dev/null &

# Watch for the output of `cem analyze` and re-convert the wc file.  This itself
# will trigger 11ty..
inotifywait -m -e modify -e create -e delete -e moved_to --format '%w%f' \
    "./dist/custom-elements.json" | while read -r CHANGED_FILE
do
  echo "Changed: $CHANGED_FILE"
  npm run docs:cem2wc
done

echo "Press Ctrl+c again to quit"

# Wait for eleventy and cem to finish.
wait

