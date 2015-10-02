var gulp = require('gulp');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var del = require('del');

var build_path =  "build";
var paths = {
    ts_files: [
        'src/ByteArray.ts'
    ],
    ts_classes: ['ByteArray'],
    js_scripts: [build_path+'/**/*.js']
};

gulp.task('cleanES5', function(cb) {
    del(['build/es5'], cb);
});

gulp.task('cleanES6', function(cb) {
    del(['build/es6'], cb);
});

var tsc_cmd = 'tsc -t "ES5" --out <%= dest(file.path) %> <%= file.path %>  --sourcemap';
var echo = 'echo [--:--:--] Compiling \033[1;33m<%= className(file.path) %>\033[0m';

gulp.task('compileES5', ['cleanES5'], function(){
    return gulp.src(paths.ts_files)
        .pipe(shell([echo+' (ES5)',tsc_cmd], {
            templateData: {
                dest: function (s) {
                    var d = s.substring(s.lastIndexOf("\\")+1, s.length);
                    return build_path+"/es5/"+d.replace(/ts/, 'js');
                },
                className: function(s){
                    return s.substring(s.lastIndexOf("\\")+1, s.length);
                }
            }
        }));
});

gulp.task('compileES6', ['cleanES6'], function(){
    var tsc = tsc_cmd.replace("ES5","ES6");
    return gulp.src(paths.ts_files)
        .pipe(shell([echo+' (ES6)',tsc], {
            templateData: {
                dest: function (s) {
                    var d = s.substring(s.lastIndexOf("\\")+1, s.length);
                    return build_path+"/es6/"+d.replace(/ts/, 'js');
                },
                className: function(s){
                    return s.substring(s.lastIndexOf("\\")+1, s.length);
                }
            }
        }));
});

gulp.task('optimize', function() {
    return gulp.src(paths.js_scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify({ outSourceMap: true }))
        .pipe(rename(function (path) {
            if(path.extname === '.js') {
                path.basename += '.min';
            }
        }))
        .pipe(gulp.dest(build_path));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('watchES5', function() {
    gulp.watch('src/**/*.ts', ['compileES5']);
});

gulp.task('watchES6', function() {
    gulp.watch('src/**/*.ts', ['compileES6']);
});

gulp.task('compile', ['compileES5','compileES6']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', function(callback){
    runSequence('compileES5', callback);
});