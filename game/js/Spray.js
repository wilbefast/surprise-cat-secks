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

/*** CLASS representing a spray of flames, liquid-nitrogen or nerve-gas ***/

/// CLASS VARIABLES/CONSTANTS
// aging
Spray.AGING_SPEED = 0.004;
Spray.MAX_SIZE = 128;
// speed
Spray.SPEED = 2.4;

/// INSTANCE ATTRIBUTES/METHODS
function Spray(init_pos, init_dir, bonus_speed)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Spray;
  
  // real attributes
  var pos,	// V2: current position
      speed,	// V2: velocity
      age,	// real: between 0 (birth) and 1 (death)
      size;	// real: between 0 (birth) and typ.MAX_SIZE (death)
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  obj.draw = function()
  {
    context.fillStyle = "rgba(255, 255, 0," + (1.0-age) + ")";
    context.fillRect(pos.x()-size/2, pos.y()-size/2, size, size);
  }
  
  obj.update = function(game, t_multiplier)
  {
    // move the cloud
    pos.addXY(speed.x()*t_multiplier, speed.y()*t_multiplier);
    
    // the clouds gets older, becoming larger and thinner, then dying
    age += typ.AGING_SPEED;
    if(age >= 1.0)
      return true;
    size = typ.MAX_SIZE * age;
    
    // destroy if off-screen
    if((pos.x() > canvas.width + size/2)
      ||(pos.x() < -size/2)
      ||(pos.y() > canvas.height + size/2)
      ||(pos.y() < -size/2))
	return true;
    
    // don't destroy this object
    return false;
  }
    
  /* INITIALISE */
  
  // position
  pos = new V2();
  pos.setV2(init_pos);
  // speed
  speed = new V2();
  speed.setV2(init_dir);
  speed.scale(typ.SPEED);
  speed.addV2(bonus_speed);
  // size and age
  age = 0.0;
  size = 0.0;
  
  /* RETURN INSTANCE */
  return obj;
}