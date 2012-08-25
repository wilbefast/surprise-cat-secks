/** @author William J.D. **/

/*
Generic javascript base-code for HTML5 games.
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

/* GLOBAL VARIABLES */

// DATA_LOCATION variable must be defined before this script is included!

// html5 objects
var canvas = document.getElementById('game_canvas');
var context = canvas.getContext('2d');

// the main application holder
var game;

/* RESOURCE MANAGEMENT */

var total_to_load = 0;
var left_to_load = 0;
var resourceLoaded = function()
{
  // one less to wait for
  if(left_to_load > 0)
    left_to_load--;
}

function load_resource(resource_obj, file_name)
{
  resource_obj.src = DATA_LOCATION + file_name;
  
  // make sure we wait till its loaded
  resource_obj.onload = resourceLoaded;
  left_to_load++;
  total_to_load++;
  
  // return the handler
  return resource_obj;  
}

// simple image-loading API
function load_image(file_name)
{
  load_resource(new Image(), file_name);
}

// simple audio-loading API
function load_audio(file_name)
{
  load_resource(new Audio(), file_name);
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
