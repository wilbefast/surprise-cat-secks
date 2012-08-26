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
// types of cloud, used to index other constants
Cloud.N_TYPES = 3;
Cloud.NAPALM = 0;
Cloud.NERVE_GAS = 1;
Cloud.LIQUID_NITROGEN = 2;
// aging
Cloud.AGING_SPEED = [0.012, 0.009, 0.01];
Cloud.MAX_SIZE = [128, 256, 96];
// speed
Cloud.SPEED = [2.4, 2.2, 2.6];
Cloud.FRICTION = [0.01, 0.017, 0.004];
// damage
Cloud.BASE_DAMAGE = [5.6, 3.2, 4.4];
// colour
Cloud.COLOUR = ["rgba(255, 255, 0,", "rgba(225, 60, 225,", "rgba(200, 200, 255,"]

/// INSTANCE ATTRIBUTES/METHODS
function Cloud(init_type, init_pos, init_dir, bonus_speed)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  // receiver 
  var obj = this, typ = Cloud;
  
  // real attributes
  // V2: current position
  var pos = new V2(init_pos.x(), init_pos.y()),	
  // V2: velocity
      speed = new V2(init_dir.x(), init_dir.y()),	
  // real: between 0 (birth) and 1 (death)
      age = 0.0,	
  // real: between 0 (birth) and typ.MAX_SIZE (death)
      size = 0.0,
      half_size = 0.0,
  // enum in Cloud.NAPALM, Cloud.NERVE_GAS or Cloud.LIQUID NITROGEN
      cloud_type = init_type,
  // damage this cloud will cause per collision
      damage;
      
  speed.scale(typ.SPEED[cloud_type]);
  speed.addV2(bonus_speed);
  
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
  obj.getCloudType = function() { return cloud_type; }
  obj.getDamage = function() { return damage; }
  
  // injections
  obj.draw = function()
  {
    context.fillStyle = typ.COLOUR[cloud_type] + (1.0-age) + ")";
    context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
  }
  
  obj.update = function(game, t_multiplier)
  {
    // move the cloud
    pos.addXY(speed.x()*t_multiplier, speed.y()*t_multiplier);
    
    // the clouds gets older, becoming larger and thinner, then dying
    // age
    age += typ.AGING_SPEED[cloud_type] * t_multiplier;
    if(age >= 1.0)
      return true;
    // size
    size = typ.MAX_SIZE[cloud_type] * age;
    half_size = size * 0.5;
    // damage
    damage = (1.0-age)*typ.BASE_DAMAGE[cloud_type];
    
    // apply friction
    if(speed.x() || speed.y())
    {
      if(speed.norm2() > 0.01)
	speed.scale(Math.pow(1-typ.FRICTION[cloud_type],t_multiplier));
      else
	speed.setNorm(0.0);
    }
    
    // lap around the edges of the screen
    lap_around(pos, half_size);   
    
    // don't destroy this object
    return false;
  }
  
  obj.collision = function(other) { }
  
  /* RETURN INSTANCE */
  return obj;
}