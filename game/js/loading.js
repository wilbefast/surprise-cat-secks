/* RESOURCE MANAGEMENT */

// DATA_LOCATION variable must be defined before this script is included!

// global variables
var total_to_load = 0;
var left_to_load = 0;

// utility functions
var resourceLoaded = function()
{
  // one less to wait for
  if(left_to_load > 0)
    left_to_load--;
}

// generic resource-loading API
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