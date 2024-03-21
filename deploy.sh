#!/usr/bin/env bash
# deploy.sh

docker run -i \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -w /work -v $PWD:/work coxauto/aws-ebcli \
    bash -c "(printf 'n\n' | eb init) && echo "n" && eb deploy"

git restore .elasticbeanstalk/config.yml