#!/bin/sh

killall gammastep

sleep 5

gammastep -c ~/dotfiles/gammastep/config.ini
