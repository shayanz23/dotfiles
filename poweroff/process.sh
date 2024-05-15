read foo

echo $foo

if [ "$foo" = "suspend" ]; then
    ~/.local/bin/hyprlock & sleep 2 && systemctl suspend 
elif [ "$foo" = "shutdown" ]; then
    shutdown now
elif [ "$foo" = "logout" ]; then
    loginctl terminate-user $USER
elif [ "$foo" = "restart" ]; then
    shutdown -r now
fi
