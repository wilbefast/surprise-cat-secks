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

/*** 2D Vector CLASS ***/

/// INSTANCE ATTRIBUTES/METHODS
function V2(init_x, init_y)
{
  /* ATTRIBUTES 
    var a = x; 
  */
  
  // receiver 
  var obj = this, typ = V2;
  
  // true attributes
  var x, y, 		// coordinates
      norm 		// the length of the vector, cached for speed
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  var recalculateNorm = function()
  {
    // values are cached to avoid calculating too many inverses and square-roots
    norm = Math.sqrt(x*x + y*y);
  }
    
    
  /* METHODS 
  (obj.f = function(p1, ... ) { }
  */
  
  // getters
  obj.x = function() { return x; }
  obj.y = function() { return y; }
  
  obj.norm = function()
  {
    if(norm < 0)
      recalculateNorm();
    return norm;
  }
  
  // setters
  obj.setX = function(new_x)
  {
    x = new_x;
    norm = -1.0;
  }
  obj.setY = function(new_y)
  {
    y = new_y;
    norm = -1.0;
  }
  obj.setXY = function(new_x, new_y)
  {
    x = new_x;
    y = new_y;
    norm = -1.0;
  }
  
  obj.setNorm = function(new_norm)
  {
    if(new_norm < 0.0)
      x = y = norm = 0.0;
    else
    {
      obj.normalise();
      x *= new_norm;
      y *= new_norm;
      norm = new_norm;
    }
  }
  
  // modification
  obj.addX = function(amount)
  {
    obj.setX(x + amount);
  }
  obj.addY = function(amount)
  {
    obj.setY(y + amount);
  }
  obj.addXY = function(amount_x, amount_y)
  {
    obj.setXY(x + amount_x, y + amount_y);
  }
  
  obj.addNorm = function(amount)
  {
    obj.setNorm(norm + amount);
  }
  
  obj.normalise = function()
  {
    if(norm < 0)
      recalculateNorm();
    
    var norm_inv = 1.0 / norm;
    x *= norm_inv;
    y *= norm_inv;
    
    var old_norm = norm;
    norm = norm_inv = 1.0;
    
    return old_norm;
  }
  
  /* INITIALISE AND RETURN INSTANCE */
  x = (init_x || 0.0);
  y = (init_y || 0.0);
  norm = -1.0;
  return obj;
}