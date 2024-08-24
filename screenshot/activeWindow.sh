#! /bin/bash
posx=$(hyprctl activewindow -j | jq .at.[0])
posy=$(hyprctl activewindow -j | jq .at.[1])
sizex=$(hyprctl activewindow -j | jq .size.[0])
sizey=$(hyprctl activewindow -j | jq .size.[1])

var="${posx},${posy} ${sizex}x${sizey}"

echo $var

grim -g "$var"
