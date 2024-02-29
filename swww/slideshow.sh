#! /usr/bin/bash
while [ true ]
do
    for f in ~/Pictures/backgrounds/minimalistic/*
    do
        swww img $f
        sleep 240
    done
done