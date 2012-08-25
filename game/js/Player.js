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
// size
Player.SIZE = 16;
Player.HALF_SIZE = Player.SIZE / 2;
Player.GUN_LENGTH = Player.SIZE * 1.5;
// speed
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
    pos = new V2();
    // facing, straight down by default
    facing = new V2();
    facing.setXY(0, -1);
    // speed
    speed = new V2();
  }
  
  var doMove = function(move, t_multiplier)
  {
    // apply move commands
    if(move.x() || move.y())
    {
      // reset facing
      facing.setXY(move.x(), move.y());
      if(move.x() && move.y())
	facing.normalise();
      
      // accelerate
      speed.addXY(move.x()*typ.SPEED_DELTA*t_multiplier, 
		  move.y()*typ.SPEED_DELTA*t_multiplier);
      
      // cap speed to terminal velocity
      if(speed.norm() > typ.SPEED_MAX)
	speed.setNorm(typ.SPEED_MAX);
    }
    
    // apply friction
    if(speed.x() || speed.y())
      speed.addNorm(-typ.FRICTION);
    
    
    // update position
    pos.addXY(speed.x()*t_multiplier, speed.y()*t_multiplier);
    
    // lap around 
    if(pos.x() > canvas.width + Player.HALF_SIZE)
      pos.addX(-canvas.width - Player.HALF_SIZE );
    else if(pos.x() < -Player.HALF_SIZE)
      pos.addX(canvas.width + Player.HALF_SIZE);
    
    if(pos.y() > canvas.height + Player.HALF_SIZE)
      pos.addY(-canvas.height - Player.HALF_SIZE );
    else if(pos.y() < -Player.HALF_SIZE)
      pos.addY(canvas.height + Player.HALF_SIZE);
    
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
    context.moveTo(pos.x(), pos.y());
    context.lineTo(pos.x() + Player.GUN_LENGTH*facing.x(), 
		   pos.y() + Player.GUN_LENGTH*facing.y());
    context.stroke();
    
    // draw character
    context.fillRect(pos.x()-Player.HALF_SIZE, pos.y()-Player.HALF_SIZE, 
		      Player.SIZE, Player.SIZE);
  }
  
  obj.update = function(game, t_multiplier)
  {
    doMove(game.getKDirection(), t_multiplier);
    doShoot(game.isKShoot(), t_multiplier);
  }
    
  /* INITIALISE AND RETURN INSTANCE */
  reset();
  pos.setXY((x || 0.0), (y || 0.0));
  return obj;
}