@echo off
set PAUSE_ERRORS=1
set CLOSURE="C:\Program Files (x86)\FlashDevelop\Tools\google\compiler.jar"

set tsFileName=%3
set jsFileName=%tsFileName:.ts=.js%
set jsMinFileName=%tsFileName:.ts=.min.js%
call java -jar %CLOSURE% --compilation_level SIMPLE_OPTIMIZATIONS --js  "%1/build/%jsFileName%" --js_output_file "%1/build/%jsMinFileName%"