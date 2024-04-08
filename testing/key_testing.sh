#! /usr/bin/bash

for (( i=30; i>0; i--)); do
    printf "\rStarting script in $i seconds.  Hit any key to continue."
    read -s -n 1 -t 1 key
    if [ $? -eq 0 ]
    then
    echo
        echo "donkey"
        break;
    fi
done
echo "Resume script"
