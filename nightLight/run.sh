#! /usr/bin/bash
local starttime=$(date --date="23:00" +"%s")
local endtime=$(date --date="06:30" +"%s")

local currenttime=$(date +%s)
if [[ "$currenttime" > "23:00" ]] || [[ "$currenttime" < "06:30" ]]; then
    busctl --user -- set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 2500 > ~/donkey2.txt
else
    busctl --user -- set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 6500 > ~/donkey2.txt
fi

sleep 60

source ~/dotfiles/nightLight/run.sh