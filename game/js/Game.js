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


/*** GAME CLASS ***/

/// CLASS VARIABLES/CONSTANTS
// strings
Game.TITLE = "Black Dog";
Game.AUTHOR = "By William 'wilbefast' J.D.";
// timing: maximum number of frames per second
Game.MAX_FPS = 60;
// left keys
Game.K_LEFT = 37;
Game.K_A = 'A'.charCodeAt(0);		// qwerty + dvorak
Game.K_Q = 'Q'.charCodeAt(0);		// azerty
// right keys
Game.K_RIGHT = 39;
Game.K_D = 'D'.charCodeAt(0);		// qwerty + azerty
Game.K_E = 'E'.charCodeAt(0);		// dvorak
// up keys
Game.K_UP = 38;
Game.K_W = 'W'.charCodeAt(0);		// qwerty
Game.K_Z = 'Z'.charCodeAt(0);		// azerty
Game.K_COMMA = 1;			// dvorak
// down keys
Game.K_DOWN = 40;
Game.K_S = 'S'.charCodeAt(0);		// qwerty + azerty
Game.K_O = 'O'.charCodeAt(0);		// dvorak
// other keys
Game.K_ENTER = 13;
Game.K_SPACE = 32;
// mouse
Game.M_FADE_SPEED = 0.01;
// gameplay constants
Game.STARTING_KITTENS = Kitten.MAX_NUMBER/3;
// object types
Game.KITTEN_T = 0;
Game.PLAYER_T = 1;
Game.CLOUD_T = 2;
// colours, fonts, line widths, etc
Game.C_BACKGROUND = "rgb(186, 186, 100)";
Game.C_TEXT = "rgb(69, 69, 155)";
Game.C_OUTLINE = ["rgba(69, 69, 155, 0.9)", "rgba(69, 69, 155, 0.6)", 
		  "rgba(69, 69, 155, 0.3)"];
Game.C_MASK = "rgba(17, 17, 39, 0.9)";
Game.OUTLINE_WIDTHS = 10;
Game.CROSSHAIR_LINE_WIDTH = 3;
Game.CROSSHAIR_SIZE = 24;
Game.INFOBAR_HEIGHT = 24;
Game.INFOBAR_OFFSET = 24;


/// INSTANCE ATTRIBUTES/METHODS
function Game()
{
  /* ATTRIBUTES 
    var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Game;
  
  // true attributes
  var things,		// Array: [a, b, c, d, ...] list of dynamic game-objects
      player,		// Player: the player-character object
      k_left, k_right, 	// boolean: left and right arrow keys?
      k_up, key_down,	// boolean: up and down arrow keys?
      k_direction,	// V2: {x,y} reprenting direction pressed on key-pad
      k_shoot,		// boolean: is shoot key being pressed?
      k_wpn_change,	// boolean: is the weapon change key being pressed?
      m_shoot,		// boolean: is the mouse shoot key being pressed?
      m_pos,		// V2: {x,y} position of the mouse
      m_direction,	// V2: {x,y} normalised player->mouse direction
      m_use,		// real: value between 0 and 1, move fades if not used
      focus,		// boolean: pause if we lose focus
      time,		// time taken to kill/breed all the cats	
      kills;		// total number of cats killed
      
  /* SUBROUTINES 
    var f = function(p1, ... ) { } 
  */
  
  // reset the game to its initial state
  var reset = function()
  {
    // object management
    things = new Array();
    for(var i = 0; i < typ.STARTING_KITTENS; i++)
    {
      things.push(new Kitten());
    }
    // player character
    player = new Player(canvas.width/2, canvas.height/2);
    things.push(player);

    // keyboard
    k_direction = new V2();
    key_left = k_right = k_up = k_down = k_shoot = k_wpn_change = false;
    // mouse
    m_pos = new V2();
    m_direction = new V2();
    m_shoot = false;
    m_wheel_offset = 0;
    m_use = 0.0;
    
    // for score
    time = 0.0;
    kills = 0;
    
    // pause or unpause
    focus = true;
  }
  
  // update dynamic objects (a variable number stored in an array)
  var updateThings = function(t_multiplier)
  {
    // array of indexes of objects to be deleted
    var cleanUp = new Array();
    for(i = 0; i < things.length; i++)
    {
      var a = things[i];
      // update objects, save update result
      var deleteThing = (a == null || a.update(obj, t_multiplier));
      // delete object if the update returns true
      if(deleteThing)
      {
	things[i] = null;
	// add to cleanup list ;)
	cleanUp.push(i);
      }
      else
      {
	// generate events for these objects
	for(var j = i+1; j < things.length; j++)
	{
	  var b = things[j];
	  if(b != null && areColliding(a, b))
	  {
	    a.collision(b);
	    b.collision(a);
	  }
	}
      }
    }
    // delete the indices in the cleanup list
    for(var i = 0; i < cleanUp.length; i++)
      things.splice(cleanUp[i], 1);
  }
  
  var injectKeyState = function(key, state)
  {
    // work out what the input is
    switch(key)
    {	  
      case typ.K_LEFT: 	case typ.K_A: 	case typ.K_Q:	
	k_left = state; 	
	break;
      case typ.K_RIGHT: case typ.K_D: 	case typ.K_E: 	
	k_right = state; 
	break;
      case typ.K_UP: 	case typ.K_W: 	case typ.K_Z:	case typ.K_COMMA:		
	k_up = state; 	
	break;
      case typ.K_DOWN:	case typ.K_S:	case typ.K_O: 		
	k_down = state; 	
	break;
      case typ.K_SPACE:		
	k_shoot = state; 
	break;
      case typ.K_ENTER:
	if(state && !k_wpn_change)
	  player.change_weapon(1);
	k_wpn_change = state;
	break;
    }
    
    // reset the direction based on input
    k_direction.setX((k_left && !k_right) ? -1 : ((!k_left && k_right) ? 1 : 0));
    k_direction.setY((k_up && !k_down) ? -1 : ((!k_up && k_down) ? 1 : 0));
    
    // normalise only if nessecary
    if(k_direction.x() && k_direction.x())
      k_direction.normalise();
  }
  
  var injectMouseDir = function(x, y)
  {
    m_direction.setFromTo(player.getPosition(), m_pos);
    m_direction.normalise();
  }
  
  // drawing
  
  var draw_outline = function()
  {
    // the top box
    context.fillStyle = Game.C_TEXT;
    context.fillRect(0, 0, canvas.width, typ.INFOBAR_HEIGHT);
    // three concentric rectangles of varying sizes
    context.lineWidth = typ.OUTLINE_WIDTHS;
    for(var i = 0; i < 3; i++)
    {
      var offset = (i+0.5)*typ.OUTLINE_WIDTHS;
      context.strokeStyle = typ.C_OUTLINE[i];
      context.strokeRect(offset, offset + typ.INFOBAR_HEIGHT, 
	canvas.width-offset*2, canvas.height-offset*2 - typ.INFOBAR_HEIGHT);
    }
  }
  
  var draw_crosshair = function()
  {
    // diamond shape
    context.beginPath();
    context.strokeStyle = Cloud.COLOUR[player.getWeapon()] + m_use + ")";
    context.moveTo(m_pos.x(), m_pos.y()-typ.CROSSHAIR_SIZE);	// top
    context.lineTo(m_pos.x()+typ.CROSSHAIR_SIZE, m_pos.y());	// right
    context.lineTo(m_pos.x(), m_pos.y()+typ.CROSSHAIR_SIZE);	// bottom
    context.lineTo(m_pos.x()-typ.CROSSHAIR_SIZE, m_pos.y());	// left
    context.closePath();
    context.stroke();
  }
  
  var draw_info = function()
  {
    context.fillStyle = "rgb(221,221,221)";
    context.font = "22pt cube";
    context.textBaseline = "top";
    // remaining cats
      context.textAlign = "left";
      context.fillText("Cats: " + Kitten.number, typ.INFOBAR_OFFSET, 0);
    // numer of kills
      context.textAlign = "center";
      context.fillText("Kills: " + kills, canvas.width/2, 0);
    // time taken so far
      context.textAlign = "right";
      context.fillText("Time: " + Math.floor(time), 
		       canvas.width-typ.INFOBAR_OFFSET, 0);
  }
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getInputMove = function() 
  { 
    return k_direction; 
  }
  obj.isInputShoot = function() { return (k_shoot||m_shoot); }
  obj.isInputMouse = function() { return m_shoot; }
  obj.getInputMouse = function() { return m_direction; }
  obj.getPlayer = function() { return player; }
  obj.isFocus = function() { return focus; }
  
  // modification
  obj.setFocus = function(new_focus) 
  { 
    if(focus && !new_focus)
    {
      // redraw once without the cursor
      m_use = 0;
      obj.injectDraw();
      
      // apply mask
      context.fillStyle = Game.C_MASK;
      context.fillRect(0,0,canvas.width, canvas.height);
      
      // draw the score on top of the mask
      draw_info();
      
      // draw "loading" text
      context.fillStyle = Game.C_BACKGROUND;
      context.font = "32pt cube";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Paused", canvas.width/2, canvas.height/2);
    }

    focus = new_focus; 
  }
  
  obj.addThing = function(new_thing)
  {
    things.push(new_thing);
  }
  
  obj.addKill = function() { kills++; }
  
  // injections
  obj.injectUpdate = function(t_multiplier)
  {
    if(!focus)
      return;
    
    // increment the timer
    time += t_multiplier/typ.MAX_FPS;
    
    // gradually hide the cursor
    if(!m_shoot)
    {
      if(m_use > typ.M_FADE_SPEED)
	m_use -= typ.M_FADE_SPEED;
      else
	m_use = 0.0;
    }
    
    // update game objects
    updateThings(t_multiplier);
  }
 
  obj.injectDraw = function()
  {
    if(!focus)
      return;

    // clear canvas
    context.fillStyle = Game.C_BACKGROUND;
    context.fillRect(0,0,canvas.width, canvas.height);
    
    // draw objects
    for(var i = 0; i < things.length; i++)
      if(things[i] != null)	// uber-rare but did happen... once o_O
	things[i].draw();
      
    // draw outline overlay
    draw_outline();
  
    // draw crosshair
    if(m_use > 0)
      draw_crosshair();
    
    // draw info-bar
    draw_info();
  }
  
  obj.injectMouseDown = function(x, y) 
  { 
    if(!focus)
      focus = true;
    else
    {
      m_shoot = true;
      m_pos.setXY(x, y);
      injectMouseDir(x, y);
      
      // make cursor appear
      m_use = 1.0;
    }
  }
  
  obj.injectMouseUp = function(x, y) 
  {   
    // release mouse button even when not focused!
    m_shoot = false;
  }
  
  obj.injectMouseMove = function(x, y)
  {
    if(!focus)
      return;
    
    // move cursor
    m_pos.setXY(x, y);
    if(m_shoot)
      injectMouseDir(x, y);
    
    // cursor visible only if used
    m_use = Math.max(0.5, m_use);
    if(m_use < 1.0 - typ.M_FADE_SPEED)
      m_use += typ.M_FADE_SPEED;
    else
      m_use = 1.0;
  }
  
  obj.injectMouseWheel = function(delta)
  {    
    if(!focus)
      return;
    
    player.change_weapon(sign(delta));
  }
  
  obj.injectKeyDown = function(key)
  {
    if(!focus)
      return;
    injectKeyState(key, true);
  }
  
  obj.injectKeyUp = function(key)
  {
    // release key even when not focused!
    injectKeyState(key, false);
  }

  /* INITIALISE AND RETURN INSTANCE */
  reset();
  return obj;
}

// singleton instance
Game.INSTANCE = new Game();