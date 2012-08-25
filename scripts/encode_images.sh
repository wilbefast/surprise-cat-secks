#!/bin/bash

# turns all PNG files in the current directory into a video.
# William Dyce http://wilbefast.com

n=0
for old in *.png; do
  new=$(printf "%06d.png" ${n})
  mv ${old} ${new}
  let n=n+1
done

ffmpeg -b 1800 -r 30 -i %06d.png -vcodec libx264 -crf 0 -vpre lossless_ultrafast -threads 0 out.mkv