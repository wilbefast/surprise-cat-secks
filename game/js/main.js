/** @author William J.D. **/

/*
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

var next_tick = 0, missed_ticks = 0, this_tick = 0;

function init_timing()
{
  // The future is now!
  next_tick = (new Date()).getTime();
}

function wait(f)
{
  // Get the current time-stamp
  this_tick = (new Date()).getTime();

  // If it's not yet time for the next update, wait a while
  if (this_tick < next_tick)
  {
    setTimeout(f, next_tick - this_tick);
    missed_ticks = 0;
  }
  else
  {
    setTimeout(f, 0);
    missed_ticks = this_tick - next_tick;
  }

  // Calculate when the next update should be
  next_tick = this_tick + (1000 / Game.MAX_FPS);
}

function update_loop()
{
  // update the Game
  Game.INSTANCE.injectUpdate(1.0 + missed_ticks/1000.0*Game.MAX_FPS);
  
  // redraw the Game
  Game.INSTANCE.injectDraw();
  
  // repeat this function after a short delay
  wait(update_loop);
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
    context.font = "20pt Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    var percent_loaded = 100 - Math.round((left_to_load/total_to_load)*100);
    context.fillText("Loading " + percent_loaded + "%",
		      canvas.width/2, canvas.height/2);
				    
    // check again in 0.5 seconds
    setTimeout("loading_screen()", 500);
  }
  else
  {
    // create the game object
    Game.INSTANCE = new Game();
    init_timing();
    update_loop();
  }
    
}

function main() 
{
  // loading screen will launch the game when resources are in memory
  loading_screen();
}

/* INPUT HANDLING */

canvas.onmousedown = function(event)
{
  Game.INSTANCE.injectMouseDown(event.layerX - canvas.offsetLeft,
		      event.layerY - canvas.offsetTop);
  event.stopPropagation();
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


/* LAUNCH THE APPLICATION */

main();
