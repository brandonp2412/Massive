#!/bin/sh

ls *.ts* | entr yarn lint | tee >(
  while read ln; do 
    if echo "${ln}" | grep -q "error"; then 
      notify-send "${ln}"
    fi
  done
) &
yarn tsc --watch --preserveWatchOutput | tee >(
  while read ln; do 
    if echo "${ln}" | grep -q "Found [^0][0-9]* error"; then 
      notify-send "${ln}"
    fi
  done
) &
