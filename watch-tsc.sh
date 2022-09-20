#!/bin/sh

yarn tsc --watch --preserveWatchOutput | tee >(
  while read ln; do 
    if echo "${ln}" | grep -q "Found [^0][0-9]* error"; then 
      notify-send "${ln}"
    fi
  done
)
