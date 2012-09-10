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

/*** DECAL CLASS, for blood stains, etc ***/

/// CLASS VARIABLES/CONSTANTS
Decal.POS_VAR_REL = 0.8;
Decal.SIZE_VAR = 0.5;
Decal.AGING_SPEED = 0.005;
Decal.AGE_VAR = 0.2;
Decal.MAX_DESIRED_OBJECTS = 35;
Decal.objects;
Decal.BLOOD = 0;
Decal.FOOTPRINT = 1;

/// INSTANCE ATTRIBUTES/METHODS
function Decal(base_pos, base_size, init_colour, init_type,
	       opt_size_var, opt_pos_var_rel)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Decal;
  
  // local
  var pos_var = (opt_pos_var_rel != null ? opt_pos_var_rel : typ.POS_VAR_REL*base_size),
      size_var = (opt_size_var != null ? opt_size_var : typ.SIZE_VAR);
  
  // real attributes
  // V2: current position
  var pos = new V2(base_pos.x()+rand_between(-pos_var, pos_var), 
		   base_pos.y()+rand_between(-pos_var, pos_var)),	
  // real: between 0 (birth) and 1 (death)
      age = 0.0 + rand_between(0.0, typ.AGE_VAR),	
  // real: between 0 (birth) and typ.MAX_SIZE (death)
      size = base_size + base_size*rand_between(-size_var, size_var),
      half_size = size * 0.5,
  // string: incomplete "rgba(r,g,b," string
      colour = init_colour,
      decal_type = init_type;
      
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.getPosition = function() { return pos; }
  obj.getRadius = function() { return half_size; }
  obj.getType = function() { return typ; }
  
  // injections
  obj.draw = function()
  {
    context.fillStyle = colour + (1.0-age) + ")";
    context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
  }
  
  obj.update = function(t_multiplier)
  {
    // slowly decay
    age += typ.AGING_SPEED * t_multiplier
      // countdown faster the more objects there are
      * (typ.objects.length/typ.MAX_DESIRED_OBJECTS);
    // destroy at the end of the counter
    if(age > 1.0)
      return true;
    
    // don't destroy this object
    return false;
  }
  
  obj.collision = function(other) 
  {
    // stain the feet of passers-by
    if(other.getType() == Player && decal_type == typ.BLOOD)
      other.addFootRedness(Player.STAIN_RED_BONUS * (1-age));
  }
  
  /* RETURN INSTANCE */
  typ.objects.push(obj);
  return obj;
}