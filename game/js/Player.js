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

Player.SPEED_MAX = 1.9;
Player.SPEED_DELTA = Player.SPEED_MAX / 8.0;
Player.SPEED_MAX_2 = Math.pow(Player.SPEED_MAX, 2);
Player.SPEED_MAX_INV = 1.0 / Player.SPEED_MAX;
Player.FRICTION = Player.SPEED_MAX / 16.0;

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
      facing,	// {x,y} between -1 and 1, representing aiming direction 
      speed;	// {x,y,norm,norm2, norm_inv} axial speeds, norm, norm squared 
		// and inverted
      
  /* SUBROUTINES 
    var f = function(p1, ... ) { } 
  */
  var reset = function()
  {
    // position
    pos = new Object;
    // facing, straight down by default
    facing = new Object;
    facing.x = 0;
    facing.y = -1;
    // speed
    speed = new V2();
  }
  
  var doMove = function(move, t_multiplier)
  {
    // apply move commands
    if(move.x || move.y)
    {
      // reset facing
      facing.x = move.x;
      facing.y = move.y;
      
      // accelerate
      speed.addXY(move.x*typ.SPEED_DELTA*t_multiplier, 
		  move.y*typ.SPEED_DELTA*t_multiplier);
      
      // cap speed to terminal velocity
      if(speed.norm() > typ.SPEED_MAX)
	speed.setNorm(typ.SPEED_MAX);
    }
    
    // apply friction
    if(speed.x() || speed.y())
      speed.addNorm(-typ.FRICTION);
    
    
    // update position
    pos.x += speed.x()*t_multiplier;
    pos.y += speed.y()*t_multiplier;
  }
  
  var doShoot = function(shoot, t_multiplier)
  {
  }
 
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  obj.draw = function()
  {
    context.fillStyle = Game.C_TEXT;
    
    // draw gun
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    context.lineTo(pos.x + 24*facing.x, pos.y + 24*facing.y);
    context.stroke();
    
    // draw character
    context.fillRect(pos.x-8, pos.y-8, 16, 16);
  }
  
  obj.update = function(game, t_multiplier)
  {
    doMove(game.getKDirection(), t_multiplier);
    doShoot(game.isKShoot(), t_multiplier);
  }
    
  /* INITIALISE AND RETURN INSTANCE */
  reset();
  pos.x = x || 0.0;
  pos.y = y || 0.0;
  return obj;
}