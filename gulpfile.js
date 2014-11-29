var gulp = require('gulp');
var shell = require('gulp-shell');
var cc = require('gulp-closure-compiler');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
    ts_classes: ['BitArray','ByteArray','ByteArrayBase'],
    js_scripts: ['build/*.js']
};

gulp.task('clean', function(cb) {
    del(['build'], cb);

});

var shellCompileTasks = [];
Object.keys(paths.ts_classes).forEach(function(index) {
    var className = paths.ts_classes[index];
    shellCompileTasks.push('echo Compiling:'+className+'.ts');
    shellCompileTasks.push('tsc -t "ES5" --declaration --out "build/'+className+'.js" "src/'+className+'.ts"  --sourcemap');
});

gulp.task('compile', ['clean'], shell.task(shellCompileTasks));

gulp.task('optimize', function() {
    return gulp.src(paths.js_scripts)
        .pipe(sourcemaps.init())
        .pipe(cc({
            compilerPath: 'bower_components/closure-compiler/compiler.jar',
            compilerFlags: {
                compilation_level: 'ADVANCED_OPTIMIZATIONS',
                define: [
                    "goog.DEBUG=false"
                ],
                // Some compiler flags (like --use_types_for_optimization) don't have value. Use null.
                // use_types_for_optimization: null,
                only_closure_dependencies: true,
                output_wrapper: '(function(){%output%})();',
                warning_level: 'VERBOSE'
            }
        }))
        .pipe(gulp.dest('build'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['compile']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['compile']);