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

var element_offset = function(element)
{
  var ox = 0, oy = 0;
  if (element.offsetParent) 
  {
    do 
    {
      ox += element.offsetLeft;
      oy += element.offsetTop;
    } 
    while (element = element.offsetParent);
    
    return { x: ox, y: oy };
  }
  else
    return undefined;
}
var canvas_offset = element_offset(canvas);

var areColliding = function(a, b)
{
  return (a.getPosition().dist2(b.getPosition()) 
	  < Math.pow(a.getRadius() + b.getRadius(), 2));
}

var sign = function(x)
{
  return (x>0) ? 1 : ((x<0) ? -1 : 0);
}

function rand_between(x, y)
{
  return Math.random()*(Math.abs(x-y)) + Math.min(x,y);
}

function rand_sign()
{
  return (Math.random() < 0.5) ? -1 : 1;
}

var lap_around = function(pos, half_size)
{
  // lap around 
  if(pos.x() > canvas.width + half_size)
    pos.addX(-canvas.width - half_size);
  else if(pos.x() < -half_size)
    pos.addX(canvas.width + half_size);

  if(pos.y() > canvas.height + half_size)
    pos.addY(-canvas.height - half_size /*+ Game.INFOBAR_HEIGHT*/);
  else if(pos.y() < -half_size /*+ Game.INFOBAR_HEIGHT*/)
    pos.addY(canvas.height + half_size /*- Game.INFOBAR_HEIGHT*/);
}