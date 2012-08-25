/** @author William J. Dyce */

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

/*** GAME CLASS ***/

/// CLASS VARIABLES/CONSTANTS
// singleton instance
Game.INSTANCE = null;
// strings
Game.TITLE = "Black Dog";
Game.AUTHOR = "By William 'wilbefast' J.D.";
// maximum frames per second
Game.MAX_FPS = 30;
// colours
Game.C_BACKGROUND = 'rgb(255, 0, 0)';
Game.C_TEXT = 'rgb(0, 0, 128)';
// key-codes
Game.K_LEFT = 37;
Game.K_RIGHT = 39;
Game.K_UP = 38;
Game.K_DOWN = 40;
Game.K_CTRL = 17;
Game.K_SPACE = 32;


/// INSTANCE ATTRIBUTES/METHODS
function Game()
{
    /* ATTRIBUTES 
      var a = x; 
    */
    
    // receiver 
    var obj = this, typ = Game;
    
    // true attributes
    var monkeys,	// list of dynamic game-objects
	k_direction;	// [x,y] reprenting direction pressed on key-pad
	
    /* SUBROUTINES 
      var f = function(p1, ... ) { } 
    */
    
    // reset the game to its initial state
    var reset = function()
    {
      // initialise attributes
      monkeys = new Array();
      k_direction = new Array();
      k_direction[0] = k_direction[1] = 0;
    }
    
    // update dynamic objects (a variable number stored in an array)
    var updateMonkeys = function()
    {
      // array of indexes of objects to be deleted
      var cleanUp = new Array();
      for(i = 0; i < monkeys.length; i++)
      {
	// update objects, save update result
	var deleteObject = (objects[i] == null || monkeys[i].update());
	// delete object if the update returns true
	if(deleteObject)
	{
	  monkeys[i] = null;
	  // add to cleanup list ;)
	  cleanUp.push(i);
	}
	else
	{
	}
      }
      // delete the indices in the cleanup list
      for(i=0; i < cleanUp.length; i++)
	monkeys.splice(cleanUp[i], 1);
    }
    
    /* METHODS 
      (obj.f = function(p1, ... ) { }
    */
    obj.injectUpdate = function()
    {
      // your code here
    }
    
    obj.injectDraw = function()
    {
      // your code here
    }
    
    obj.injectMouseDown = function(x, y)
    {
      // your code here
    }
    
    obj.injectMouseUp = function(x, y)
    {
      // your code here
    }
    
    obj.injectKeyDown = function(key)
    {
      switch(key)
      {	  
	case typ.K_LEFT:
	  k_direction[0] = (k_direction[0] > 0) ? 0 : -1;
	break;
	  
	case typ.K_RIGHT:
	  k_direction[0] = (k_direction[0] < 0) ? 0 : 1;
	break;
	
	case typ.K_UP:
	  k_direction[1] = (k_direction[1] > 0) ? 0 : -1;
	break;
	  
	case typ.K_DOWN:
	  k_direction[1] = (k_direction[1] < 0) ? 0 : 1;
	break;
      }
      
      console.log(k_direction[0] + "," + k_direction[1]);
    }
    
    obj.injectKeyUp = function(key)
    {
      switch(key)
      {	  
	case typ.K_LEFT:
	  if((k_direction[0] < 0))
	    k_direction[0] = 0;
	break;
	  
	case typ.K_RIGHT:
	  if((k_direction[0] > 0))
	    k_direction[0] = 0;
	break;
	
	case typ.K_UP:
	  if((k_direction[1] < 0))
	    k_direction[1] = 0;
	break;
	  
	case typ.K_DOWN:
	  if((k_direction[1] > 0))
	    k_direction[1] = 0;
	break;
      }
      
      console.log(k_direction[0] + "," + k_direction[1]);
    }

    /* INITIALISE AND RETURN INSTANCE */
    reset();
    return obj;
}