#!/bin/sh

ls *.ts* | entr yarn lint | tee >(
  while read ln; do 
    if echo "${ln}" | grep -q "error"; then 
      notify-send "${ln}"
    fi
  done
)
