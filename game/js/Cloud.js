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


/*** CLASS representing a cloud of flames, liquid-nitrogen or nerve-gas ***/

/// CLASS CONSTANTS
// types of cloud, used to index other constants
Cloud.N_TYPES = 4;
Cloud.NAPALM = 0;
Cloud.NERVE_GAS = 1;
Cloud.NITROGEN = 2;
Cloud.FERTILITY = 3;
Cloud.HEART = 4;	// a pseudo-cloud using custom draw code
// aging
Cloud.AGING_SPEED = [0.012, 0.009, 0.01, 0.016, 0.021];
Cloud.MAX_SIZE = [128, 256, 96, 64, 48];
// speed
Cloud.SPEED = [2.4, 2.2, 2.6, 3.1, 0];
Cloud.FRICTION = [0.01, 0.017, 0.004, 0.002, 0];
// damage
Cloud.BASE_DAMAGE = [2.7, 0.4, 2.3, 1.0, 0.0];
// colour
Cloud.COLOUR = ["rgba(255, 200, 0,", "rgba(145, 255, 0,", "rgba(0, 255, 255,",
		"rgba(255, 0, 200, ", "rgba(255, 50, 200," ]

/// CLASS CONSTANTS
// objects of this class
Cloud.objects;

/// INSTANCE ATTRIBUTES/METHODS
function Cloud(init_type, init_pos, init_dir, bonus_speed, custom_draw)
{
  /* ATTRIBUTES 
  var a = x; 
  */
  
  if(!bonus_speed) bonus_speed = new V2();
  if(!init_dir) init_dir = new V2();
  
  // receiver 
  var obj = this, typ = Cloud;
  
  // real attributes
  // V2: current position
  var pos = new V2(init_pos.x(), init_pos.y()),	
  // V2: velocity
      speed = new V2(init_dir.x(), init_dir.y()),	
  // Bank: real between 0 (birth) and 1 (death)
      age = new Bank(),
  // real: between 0 (birth) and typ.MAX_SIZE (death)
      size = 0.0,
      half_size = 0.0,
  // enum in Cloud.NAPALM, Cloud.NERVE_GAS or Cloud.LIQUID NITROGEN
      cloud_type = init_type;
      
  speed.scale(typ.SPEED[cloud_type]);
  speed.addV2(bonus_speed);
  
  /* SUBROUTINES 
  var f = function(p1, ... ) { } 
  */
  
  var default_draw = function(pos, size, colour)
  {
    context.fillStyle = colour;
    context.fillRect(pos.x()-half_size, pos.y()-half_size, size, size);
  }
  
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
    var colour = typ.COLOUR[cloud_type] + (1.0-age.getBalance()) + ")";
    return (custom_draw != null) ? custom_draw(pos, size, colour) 
				  : default_draw(pos, size, colour)
  }
  
  obj.update = function(t_multiplier)
  {
    // move the cloud
    pos.addXY(speed.x()*t_multiplier, speed.y()*t_multiplier);
    
    // the clouds gets older, becoming larger and thinner, then dying
    // age
    age.deposit(typ.AGING_SPEED[cloud_type] * t_multiplier);
    if(age.isFull())
      return true;
    // size
    size = typ.MAX_SIZE[cloud_type] * age.getBalance();
    half_size = size * 0.5;
    // damage
    damage = (1.0-age.getBalance())*typ.BASE_DAMAGE[cloud_type];
    
    // apply friction
    if(speed.x() || speed.y())
    {
      if(speed.norm2() > 0.01)
	speed.scale(Math.pow(1-typ.FRICTION[cloud_type], t_multiplier));
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
  typ.objects.push(obj);
  return obj;
}