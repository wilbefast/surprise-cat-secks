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

/*** PLAYER CHARACTER CLASS CLASS ***/

/// CLASS VARIABLES/CONSTANTS

Player.SPEED_DELTA = 0.6;
Player.SPEED_MAX = 2.0;
Player.SPEED_MAX_2 = Math.pow(Player.SPEED_MAX, 2);
Player.SPEED_MAX_INV = 1.0 / Player.SPEED_MAX;

/// INSTANCE ATTRIBUTES/METHODS

function Player(x, y)
{
  /* ATTRIBUTES 
    var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Player;
  
  // true attributes
  var pos,	// {x,y} coordinates
      speed;	// {x,y,norm,norm2, norm_inv} axial speeds, norm, norm squared 
		// and inverted
      
  /* SUBROUTINES 
    var f = function(p1, ... ) { } 
  */
  var reset = function()
  {
    pos = new Object;
    speed = new Object;
  }
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  obj.draw = function()
  {
    context.fillStyle = Game.C_TEXT;
    context.fillRect(pos.x-8, pos.y-8, 16, 16);
  }
  
  obj.update = function(move, shoot)
  {
    // apply move commands
    if(move.x || move.y)
    {
      // accelerate
      speed.x += move.x*typ.SPEED_DELTA;
      speed.y += move.y*typ.SPEED_DELTA;
      speed.norm2 = Math.pow(speed.x, 2) + Math.pow(speed.y, 2);
      
      // cap speed to terminal velocity
      if(speed.norm2 > typ.SPEED_MAX_2)
      {
	// NB - multiplications cost less than divisions
	speed.norm_inv = 1.0 / Math.sqrt(speed.norm2);
	speed.x *= speed.norm_inv;
	speed.y *= speed.norm_inv;
	
	// reset the cache values
	speed.norm = typ.SPEED_MAX;
	speed.norm2 = typ.SPEED_MAX_2;
	speed.norm_inv = typ.SPEED_MAX_INV;
      }
    }
    
    // apply friction
    if(speed.x > 0.0 && move.x <= 0)
    {
      if(speed.x > typ.FRICTION)
	speed.x -= typ.FRICTION;
      else
	speed.x = 0.0;
    }
    else if(speed.x < 0.0 && move.x >= 0)
    {
      if(speed.x < -typ.FRICTION)
	speed.x += typ.FRICTION;
      else
	speed.x = 0.0;
    }
    if(speed.y > 0.0 && move.y <= 0)
    {
      if(speed.y > typ.FRICTION)
	speed.y -= typ.FRICTION;
      else
	speed.y = 0.0;
    }
    else if(speed.y < 0.0 && move.y >= 0)
    {
      if(speed.y < -typ.FRICTION)
	speed.y += typ.FRICTION;
      else
	speed.y = 0.0;
    }
    
    
    
    if(speed.y < 0.0 && move.y >= 0)
    {
      if(speed.y < -typ.FRICTION)
	speed.y += typ.FRICTION;
      else
	speed.y = 0.0;
    }
    
    // update position
    pos.x += speed.x;
    pos.y += speed.y;
  }
    
  /* INITIALISE AND RETURN INSTANCE */
  reset();
  pos.x = x || 0.0;
  pos.y = y || 0.0;
  speed.x = speed.y = speed.norm = speed.norm2 = speed.norm_inv = 0.0;
  return obj;
}