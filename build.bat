@echo off
set PAUSE_ERRORS=1
IF %1.==. GOTO error
set CLOSURE=%1
goto build

:error
	set CLOSURE="C:\Program Files (x86)\FlashDevelop\Tools\google\compiler.jar"
	goto build

:build
	echo Compiling ByteArray.ts...
	call "%APPDATA%\npm\tsc.cmd" -d --t "ES5" --out "bin/ByteArray.js" "src/ByteArray.ts"
	echo Compiling Tests...
	call "%APPDATA%\npm\tsc.cmd" --t "ES5" --out "bin/ByteArrayTest.js" "test/ByteArrayTest.ts"
	echo Optimizing JavaScript...
	call java -jar %CLOSURE% --compilation_level SIMPLE_OPTIMIZATIONS --js  "bin/ByteArray.js" --js_output_file "bin/ByteArray.mini.js"