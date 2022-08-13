#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd $SCRIPT_DIR/..
cp -n config.dist.json config.json
cp -n docker-compose.dist.yml docker-compose.yml
docker-compose run ts-node-docker npm i
