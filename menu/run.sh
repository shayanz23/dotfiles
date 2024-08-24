#!/bin/bash
if ! $(killall fuzzel); then
    fuzzel
fi