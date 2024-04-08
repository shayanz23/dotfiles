read foo

echo $foo

if [ "$foo" = "suspend" ]; then
    swaylock -i swaylock -i ~/Pictures/backgrounds/space.jpg & sleep 1 && systemctl suspend 
elif [ "$foo" = "shutdown" ]; then
    shutdown now
elif [ "$foo" = "logout" ]; then
    loginctl terminate-user $USER
elif [ "$foo" = "restart" ]; then
    shutdown -r now
fi
