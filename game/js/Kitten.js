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

/*** CLASS representing a fluffy, flammable kitten ***/

/// CLASS VARIABLES/CONSTANTS
Kitten.SIZE = 16;
Kitten.HALF_SIZE = Kitten.SIZE / 2;
Kitten.MAX_MUTATION = 0.1;


/// INSTANCE ATTRIBUTES/METHODS
function Kitten(parent_resist)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Kitten;
  
  // real attributes
  // V2: current position
  var pos = new V2(Math.random()*canvas.width, Math.random()*canvas.height),	
  // V2: current direction
      dir = new V2(0.0, 0.0),
  // int: remaining hitpoints
      health = typ.MAX_HEALTH,	
  // [r, g, b]: resistance to fire, nerve-gas and nitro, between 0 and 1
      resist = new Array();

  // initialise resistances
  for(i = 0; i < 3; i++)
  {
    if(parent_resist)
    {
      // apply mutation
      resist[i] = parent.resist[i] 
		+ rand_between(-typ.MAX_MUTATION, typ.MAX_MUTATION);
      // cap resistance
      if(resist[i] > 1)
	resist[i] = 1;
      else if(resist[i] < 0)
	resist[i] = 0;
    }
    else
      resist[i] = 0;
  }
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  /* METHODS 
    (obj.f = function(p1, ... ) { }
  */
  
  obj.draw = function()
  {
    var r = 255*(1.0-resist[0]), 
	g = 255*(1.0-resist[1]), 
	b = 255*(1.0-resist[2]);
    
    context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    context.fillRect(pos.x()-typ.HALF_SIZE, pos.y()-typ.HALF_SIZE, 
		     typ.SIZE, typ.SIZE);
  }
  
  obj.update = function(game, t_multiplier)
  {
    // move the kitten
    //pos.addXY(dir.x()*t_multiplier, dir.y()*t_multiplier);
    
    // lap around
    lap_around(pos, typ.HALF_SIZE);   
    
    // don't destroy this object
    return false;  
  }
   
  obj.getPosition = function() { return pos; }
  
  obj.getRadius = function() { return typ.HALF_SIZE; }
    
  /* RETURN INSTANCE */
  return obj;
}