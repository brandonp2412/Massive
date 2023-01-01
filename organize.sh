#!/bin/sh

organize-imports-cli *.ts* tests/*.ts* && prettier --write *.ts* tests/*.ts*
