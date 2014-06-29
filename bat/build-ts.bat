@echo off
set tsFileName=%3
set jsFileName=%tsFileName:.ts=.js%
set jsMinFileName=%tsFileName:.ts=.min.js%
tsc -t "ES5" --out "%1/build/%jsFileName%" "%2\%tsFileName%" --sourcemap