gource -i 999999999 --follow-user William --disable-progress --user-image-dir ./avatars -1280x800 -s 120 --stop-at-end --output-framerate 60 --output-ppm-stream - | ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -crf 0 -vpre lossless_ultrafast -r 60 -threads 0 out.mkv

