read foo

echo $foo

if [ "$foo" = "speakers" ]; then
    pactl set-default-sink alsa_output.usb-Generic_USB_Audio-00.HiFi__hw_Audio__sink
elif [ "$foo" = "headphones" ]; then
    pactl set-default-sink alsa_output.usb-Generic_USB_Audio-00.HiFi__hw_Audio_1__sink
fi
