#! /usr/bin/bash
sleep 1

while [ true ]
do
    for f in ~/Pictures/backgrounds/1/*
    do
        sleep 240
        swww img $f
    done
    # read -t 5 -n 1 key
    # if [ $? = 0 ]; then
    #     echo -e "\n$key is pressed. Program Terminated"
    # else
    # echo "Waiting for a keypress"
    # fi
done