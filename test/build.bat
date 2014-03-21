@echo off
"%APPDATA%\npm\tsc.cmd" --t "ES5" --out "../bin/ByteArrayTest.js" "ByteArrayTest.ts"
pause