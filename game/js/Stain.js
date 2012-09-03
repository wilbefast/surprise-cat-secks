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

/*** (blood) STAIN CLASS ***/

/// CLASS VARIABLES/CONSTANTS
Stain.POS_VAR = 16;
Stain.SIZE_VAR = 0.5;
Stain.AGING_SPEED = 0.005;
Stain.AGE_VAR = 0.2;
Stain.objects;

/// INSTANCE ATTRIBUTES/METHODS
function Stain(base_pos, base_size, init_colour)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Stain;
  
  // real attributes
  // V2: current position
  var pos = new V2(base_pos.x()+rand_between(-typ.POS_VAR, typ.POS_VAR), 
		   base_pos.y()+rand_between(-typ.POS_VAR, typ.POS_VAR)),	
  // real: between 0 (birth) and 1 (death)
      age = 0.0 + rand_between(0.0, typ.AGE_VAR),	
  // real: between 0 (birth) and typ.MAX_SIZE (death)
      size = base_size + base_size*rand_between(-typ.SIZE_VAR, typ.SIZE_VAR),
      half_size = size * 0.5,
  // string: incomplete "rgba(r,g,b," string
      colour = init_colour;
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getPosition = function() { return pos; }
  obj.getRadius = function() { return 0; }
  obj.getType = function() { return typ; }
  
  // injections
  obj.draw = function()
  {
    context.fillStyle = colour + (1.0-age) + ")";
    context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
  }
  
  obj.update = function(game, t_multiplier)
  {
    // destroy at the end of the counter
    age += typ.AGING_SPEED;
    if(age > 1.0)
      return true;
    
    // don't destroy this object
    return false;
  }
  
  obj.collision = function(other) { }
  
  /* RETURN INSTANCE */
  typ.objects.push(obj);
  return obj;
}