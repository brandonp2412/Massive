#!/bin/sh

organize-imports-cli *.ts* tests/*.ts* && deno fmt *.ts* tests/*.ts*
