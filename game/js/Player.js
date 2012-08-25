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
Player.TURN_SPEED = 0.04;
// weapons
Player.RELOAD_TIME = 21;

/// INSTANCE ATTRIBUTES/METHODS

function Player(x, y)
{
  /* ATTRIBUTES 
    var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Player;
  
  // true attributes
  var pos,		// V2: position
      facing,		// {desired=V2, actual=V2, change_timer=real}: aim
      speed,		// V2: vertical and horizontal speed
      reloading;	// real: updates till gun is reloaded
      
  /* SUBROUTINES 
    var f = function(p1, ... ) { } 
  */

  var doMove = function(move, t_multiplier)
  {
    // apply move commands
    if(move.x() || move.y())
    {
      // reset desired facing
      if((sign(move.x()) != sign(facing.desired.x())) 
      || (sign(move.y()) != sign(facing.desired.y())))
      {
	facing.desired.setXY(move.x(), move.y());
	if(move.x() && move.y())
	  facing.desired.normalise();
      }
	

       
      // accelerate
      speed.addXY(move.x()*typ.SPEED_DELTA*t_multiplier, 
		  move.y()*typ.SPEED_DELTA*t_multiplier);
      
      // cap speed to terminal velocity
      if(speed.norm() > typ.SPEED_MAX)
	speed.setNorm(typ.SPEED_MAX);
    }
    
    // interpolate aqual angle towards desired angle
    if(facing.actual.dist2(facing.desired) < 0.01)
      facing.actual.setV2(facing.desired);
    else
    {
      var turn_dir = (facing.actual.det(facing.desired) > 0.0) ? 1 : -1
      facing.actual.addAngle(typ.TURN_SPEED*turn_dir);
      console.log("turning");
    }
    
    // apply friction
    if(speed.x() || speed.y())
      speed.addNorm(-typ.FRICTION);
    
    
    // update position
    pos.addXY(speed.x()*t_multiplier, speed.y()*t_multiplier);
    lap_around(pos, typ.HALF_SIZE);    
  }
  
  var doShoot = function(shoot, t_multiplier)
  {
    if(shoot)
    {
      if(reloading > 0.0)
	reloading -= t_multiplier;
      else
      {
	Game.INSTANCE.addThing(new Spray(pos, facing.actual, speed));
	reloading = typ.RELOAD_TIME;
      }
    }
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
    context.lineTo(pos.x() + typ.GUN_LENGTH*facing.actual.x(), 
		   pos.y() + typ.GUN_LENGTH*facing.actual.y());
    context.stroke();
    
    // draw character
    context.fillRect(pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE, 
		      typ.SIZE, typ.SIZE);
  }
  
  obj.update = function(game, t_multiplier)
  {
    doMove(game.getKDirection(), t_multiplier);
    doShoot(game.isKShoot(), t_multiplier);
  }
    
  /* INITIALISE */
  
  // position
  pos = new V2();
  // facing, straight down by default
  facing = new Object;
  facing.desired = new V2(0, -1);
  facing.actual = new V2(0, -1);
  // speed
  speed = new V2();
  pos.setXY((x || 0.0), (y || 0.0));
  // weapons
  reloading = 0;
  
  /* RETURN THE INSTANCE */
  return obj;
}