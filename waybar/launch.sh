#!/bin/sh

killall waybar

#$HOME/git/Waybar/build/waybar -c ~/dotfiles/waybar/config.jsonc -s ~/dotfiles/waybar/style.css

waybar -c ~/dotfiles/waybar/config.jsonc -s ~/dotfiles/waybar/style.css
