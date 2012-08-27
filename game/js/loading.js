/** @author William J. Dyce */

/*
"SURPRISE CAT SECKS!"
Kitten-burning game made for Ludum Dare #24 ("Evolution").
Copyright (C) 2012 William James Dyce

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* RESOURCE MANAGEMENT */

// DATA_LOCATION variable must be defined before this script is included!

// global variables
var total_to_load = 0;
var left_to_load = 0;

// utility functions
var resourceLoaded = function()
{
  console.log("LOADED");
  // one less to wait for
  if(left_to_load > 0)
    left_to_load--;
}

// simple image-loading API
function load_image(file_name)
{
  // inform the system that we want to load this image
  var image = new Image();
  image.src = DATA_LOCATION + file_name;
  
  // make sure we wait till its loaded
  image.onload = resourceLoaded;
  left_to_load++;
  total_to_load++;
  
  // return the handler so the object isn't deleted
  return image;  
}

// simple audio-loading API

function load_audio(file_name)
{
  // inform the system that we want to load this image
  var audio = new Audio();
  audio.preload = true;
  audio.src = DATA_LOCATION + file_name;
  
  // make sure we wait till its loaded
  audio.addEventListener('canplaythrough', resourceLoaded);
  left_to_load++;
  total_to_load++;
  
  // return the handler so the object isn't deleted
  return audio;
}

// simple audio-playing API
function play_audio(file_name)
{
  // create new Audio object: this allows for multiple sounds to overlap
  var audio = new Audio();
  audio.src = DATA_LOCATION + file_name;
  audio.play();
  // tell the interpretor to delete this object as soon as possible
  delete audio;
}