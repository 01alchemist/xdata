@echo off
set PAUSE_ERRORS=1
set CLOSURE="D:\SDK\JavaScript\closure-compiler\compiler.jar"

set tsFileName=%3
set jsFileName=%tsFileName:.ts=.js%
set jsMinFileName=%tsFileName:.ts=.min.js%
echo Compiling %tsFileName%...
call "%APPDATA%\npm\tsc.cmd" -t "ES5" --declaration --out "%1/build/%jsFileName%" "%2\%tsFileName%" --sourcemap
echo Optimizing %jsFileName%...
call java -jar %CLOSURE% --compilation_level SIMPLE_OPTIMIZATIONS --js  "%1/build/%jsFileName%" --js_output_file "%1/build/%jsMinFileName%"