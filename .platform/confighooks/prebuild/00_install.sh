#!/bin/bash

# need to install node first to be able to install pnpm (as at prebuild no node is present yet)
if which node > /dev/null
    then
        echo "node is installed, skipping..."
    else
        sudo curl --silent --location https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum -y install nodejs
    fi
node --version

# install
cd /var/app/staging/

# install pnpm
sudo wget -qO- https://get.pnpm.io/install.sh | sh -

# debugging..
ls -lah
pnpm -v || sudo npm install -g pnpm

pnpm install --prod

# chown -R webapp:webapp node_modules/ || true # allow to fail
sudo chown -R webapp:webapp node_modules/