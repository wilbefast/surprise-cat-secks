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
    if(Game.INSTANCE.isFocus())
    {
      // draw "loading" text
      context.fillStyle = Game.C_TEXT;
      context.font = "48pt monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      var percent_loaded = 100 - Math.round((left_to_load/total_to_load)*100);
      context.fillText("Loading " + percent_loaded + "%",
			canvas.width/2, canvas.height/2);
    }
				    
    // check again in 0.5 seconds
    setTimeout("loading_screen()", 500);
  }
  else
    update_loop();
    
}

function main() 
{
  // forced loaded state after 5 seconds
  setTimeout("left_to_load = 0;", 5000);
  // loading screen will launch the game when resources are in memory
  loading_screen();
}

/* INPUT HANDLING -- CANVAS */

canvas.onselectstart = function () { return false; }	// don't select text
canvas.onselect = function () { return false; }		// don't select text

canvas.addEventListener("mousedown", function(event)
{
  Game.INSTANCE.injectMouseDown(event.pageX-canvas_offset.x,
				event.pageY-canvas_offset.y, event.which);
  event.stopPropagation();
  
  return false;	// don't select text
});

canvas.addEventListener("mouseup", function(event)
{
  Game.INSTANCE.injectMouseUp(event.pageX-canvas_offset.x,
			      event.pageY-canvas_offset.y, event.which);
  event.stopPropagation();
});

canvas.addEventListener("mousemove", function(event)
{
  Game.INSTANCE.injectMouseMove(event.pageX-canvas_offset.x,
				event.pageY-canvas_offset.y);
  event.stopPropagation();
});

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

window.addEventListener ("keydown", function(event) 
{ 
  Game.INSTANCE.injectKeyDown(event.keyCode);
  event.stopPropagation();
});

window.addEventListener ("keyup", function(event)
{ 
  Game.INSTANCE.injectKeyUp(event.keyCode);
  event.stopPropagation();
});

/* INPUT HANDLING -- DOCUMENT */

window.addEventListener ("mousedown", function(e) 
{ 
  // since we consumed the canvas mouse events, this only occurs if we click
  // outside of the canvas ;)
  Game.INSTANCE.setFocus(false);
});

canvas.addEventListener ("mouseout", function(e) 
{ 
  // since we consumed the canvas mouse events, this only occurs if we click
  // outside of the canvas ;)
  Game.INSTANCE.setFocus(false);
});

canvas.addEventListener ("mouseover", function(e) 
{ 
  // since we consumed the canvas mouse events, this only occurs if we click
  // outside of the canvas ;)
  Game.INSTANCE.setFocus(true);
});

/* INPUT HANDLING -- LINK FIXER */
/*
tweet_this.onmouseover = function(e)
{
  var space_code = "%20", colon_code = "%3A", slash_code = "%2F", 
		    percent_code = "%25";
  var encoded_url = "http://wilbefast.com/html5/surprise_cat_secks/"
		      .replace(/\:/g, colon_code).replace(/\//g, slash_code);
  
  tweet_this.href = 
    "https://twitter.com/intent/tweet?hashtags=SurpriseCatSecks"
    + "&url=" + encoded_url 
    + "&text=" + (Game.INSTANCE.getTweet()
		    .replace(/\%/g, percent_code).replace(/\ /g, space_code)
		    .replace(/\:/g, colon_code).replace(/\//g, slash_code));
    
  
}
*/
/* LAUNCH THE APPLICATION */

main();
