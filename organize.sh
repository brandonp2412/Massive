#!/bin/sh

organize-imports-cli *.ts* && prettier --write *.ts*
