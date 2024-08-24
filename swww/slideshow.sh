#!/bin/bash
sleep 1

echo donkey
donkey=$(shuf -e ~/Pictures/backgrounds/1/*)
while [ true ]
do
    for f in $donkey
    do
        swww img $f
        sleep 240
    done
done
