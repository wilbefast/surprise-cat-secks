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

var sign = function(x)
{
  return (x>0) ? 1 : ((x<0) ? -1 : 0);
}

var lap_around = function(pos, half_size)
{
  // lap around 
  if(pos.x() > canvas.width + half_size)
    pos.addX(-canvas.width - half_size);
  else if(pos.x() < -half_size)
    pos.addX(canvas.width + half_size);

  if(pos.y() > canvas.height + half_size)
    pos.addY(-canvas.height - half_size);
  else if(pos.y() < -half_size)
    pos.addY(canvas.height + half_size);
}