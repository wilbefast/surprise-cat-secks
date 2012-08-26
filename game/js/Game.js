/** @author William J. Dyce */

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
// gameplay constants
Game.STARTING_KITTENS = 15;
// object types
Game.KITTEN_T = 0;
Game.PLAYER_T = 1;
Game.CLOUD_T = 2;
// colours, fonts, line widths, etc
Game.C_BACKGROUND = "rgb(186, 186, 100)";
Game.C_TEXT = "rgb(69, 69, 155)";
Game.C_OUTLINE = ["rgba(69, 69, 155, 0.9)", "rgba(69, 69, 155, 0.6)", 
		  "rgba(69, 69, 155, 0.3)"];
Game.OUTLINE_WIDTHS = 10;


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
      m_direction;	// V2: {x,y} normalised player->mouse direction
      
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
  
  var injectMousePos = function(x, y)
  {
    m_pos.setXY(x, y);
    m_direction.setFromTo(player.getPosition(), m_pos);
    m_direction.normalise();
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
  
  // modification
  obj.addThing = function(new_thing)
  {
    things.push(new_thing);
  }
  
  obj.injectUpdate = function(t_multiplier)
  {
    // update game objects
    updateThings(t_multiplier);
  }
 
  obj.injectDraw = function()
  {  
    // clear canvas
    context.fillStyle = Game.C_BACKGROUND;
    context.fillRect(0,0,canvas.width, canvas.height);
    
    // draw objects
    for(var i = 0; i < things.length; i++)
      if(things[i] != null)	// uber-rare but did happen... once o_O
	things[i].draw();
      
    // draw outline overlay
    context.lineWidth = typ.OUTLINE_WIDTHS;
    for(var i = 0; i < 3; i++)
    {
      var offset = (i+0.5)*typ.OUTLINE_WIDTHS;
      context.strokeStyle = typ.C_OUTLINE[i];
      context.strokeRect(offset, offset, canvas.width-offset*2, canvas.height-offset*2);
    }
  }
  
  obj.injectMouseDown = function(x, y) 
  { 
    m_shoot = true;
    injectMousePos(x, y);
  }
  
  obj.injectMouseUp = function(x, y) 
  { 
    m_shoot = false;
  }
  
  obj.injectMouseMove = function(x, y)
  {
    if(m_shoot)
      injectMousePos(x, y);
  }
  
  obj.injectMouseWheel = function(delta)
  {
    player.change_weapon(sign(delta));
  }
  
  obj.injectKeyDown = function(key)
  {
    injectKeyState(key, true);
  }
  
  obj.injectKeyUp = function(key)
  {
    injectKeyState(key, false);
  }

  /* INITIALISE AND RETURN INSTANCE */
  reset();
  return obj;
}

// singleton instance
Game.INSTANCE = new Game();