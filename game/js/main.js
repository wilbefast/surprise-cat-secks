/** @author William J.D. **/

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

var prev_tick = this_tick = (new Date()).getTime();
function update_loop()
{
  // deal with timing
  prev_tick = this_tick;
  this_tick = (new Date()).getTime();
  
  // update the Game
  Game.INSTANCE.injectUpdate((this_tick - prev_tick) / 1000 * Game.MAX_FPS);
  
  // redraw the Game
  Game.INSTANCE.injectDraw();
  
  // repeat this function after a short delay
  setTimeout(update_loop, 1000 / Game.MAX_FPS);
}

function loading_screen()
{
  // clear canvas
  context.fillStyle = Game.C_BACKGROUND;
  context.fillRect(0,0,canvas.width, canvas.height);
  
  // keep checking till loaded
  if(left_to_load > 0)
  {
    // draw "loading" text
    context.fillStyle = Game.C_TEXT;
    context.font = "48pt monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    var percent_loaded = 100 - Math.round((left_to_load/total_to_load)*100);
    context.fillText("Loading " + percent_loaded + "%",
		      canvas.width/2, canvas.height/2);
				    
    // check again in 0.5 seconds
    setTimeout("loading_screen()", 500);
  }
  else
    update_loop();
    
}

function main() 
{
  // loading screen will launch the game when resources are in memory
  loading_screen();
}

/* INPUT HANDLING -- CANVAS */

canvas.onselectstart = function () { return false; }	// don't select text
canvas.onselect = function () { return false; }		// don't select text

canvas.onmousedown = function(event)
{
  Game.INSTANCE.injectMouseDown(event.layerX - canvas.offsetLeft,
		      event.layerY - canvas.offsetTop);
  event.stopPropagation();
  
  return false;	// don't select text
}

canvas.onmouseup = function(event)
{
  Game.INSTANCE.injectMouseUp(event.layerX - canvas.offsetLeft,
		     event.layerY - canvas.offsetTop);
  event.stopPropagation();
}

canvas.onmousemove = function(event)
{

  Game.INSTANCE.injectMouseMove(event.layerX - canvas.offsetLeft,
		     event.layerY - canvas.offsetTop);
  event.stopPropagation();
}

var mousewheel = function(event)
{
  var event = window.event || event;
  var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
  
  Game.INSTANCE.injectMouseWheel(delta);
  event.stopPropagation();
}
canvas.addEventListener("DOMMouseScroll", mousewheel, false);
canvas.addEventListener("mousewheel", mousewheel, false);


/* INPUT HANDLING -- WINDOW */

window.onkeydown = function(event) 
{ 
  Game.INSTANCE.injectKeyDown(event.keyCode);
  event.stopPropagation();
}

window.onkeyup = function(event)
{ 
  Game.INSTANCE.injectKeyUp(event.keyCode);
  event.stopPropagation();
}

/* INPUT HANDLING -- DOCUMENT */

document.onmousedown = function(e) 
{ 
  // since we consumed the canvas mouse events, this only occurs if we click
  // outside of the canvas ;)
  Game.INSTANCE.setFocus(false);
}

/* LAUNCH THE APPLICATION */

main();
