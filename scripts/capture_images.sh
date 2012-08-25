#!/bin/bash

# captures a screenshot every 10 seconds.
# William Dyce http://wilbefast.com

function capture 
{
  local name=$(date +%s).png
  scrot $name
  echo $name
}


while (true)
do
  capture;
  sleep 10
done

