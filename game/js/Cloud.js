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

/*** CLASS representing a cloud of flames, liquid-nitrogen or nerve-gas ***/

/// CLASS VARIABLES/CONSTANTS
// aging
Cloud.AGING_SPEED = 0.012;
Cloud.MAX_SIZE = 128;
// speed
Cloud.SPEED = 2.4;

/// INSTANCE ATTRIBUTES/METHODS
function Cloud(init_pos, init_dir, bonus_speed)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Cloud;
  
  // real attributes
  var pos = new V2(init_pos.x(), init_pos.y()),	
  // V2: current position
      speed = new V2(init_dir.x(), init_dir.y()),	
  // V2: velocity
      age = 0.0,	
  // real: between 0 (birth) and 1 (death)
      size = 0.0,
      half_size = 0.0;
  // real: between 0 (birth) and typ.MAX_SIZE (death)
  speed.scale(typ.SPEED);
  speed.addV2(bonus_speed);
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  obj.draw = function()
  {
    context.fillStyle = "rgba(255, 255, 0," + (1.0-age) + ")";
    context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
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
    half_size = size * 0.5;
    
    // lap around the edges of the screen
    lap_around(pos, half_size);   
    
    // don't destroy this object
    return false;
  }
  
  obj.getPosition = function() { return pos; }
  
  obj.getRadius = function() { return half_size; }
  
  /* RETURN INSTANCE */
  return obj;
}