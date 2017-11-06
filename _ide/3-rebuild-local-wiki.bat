cd ..
git checkout HEAD -- wiki/
git clean wiki -f
call rake wikibuild
call rake wiki

