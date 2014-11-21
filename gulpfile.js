var gulp = require('gulp');
var foreach = require('gulp-foreach');
var shell = require('gulp-shell');
var cc = require('gulp-closure-compiler');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
    ts_scripts: ['src/BitArray.ts','src/ByteArray.ts','src/ByteArrayBase.ts'],
    js_scripts: ['build/*.js']
};

gulp.task('clean', function(cb) {
    del(['build'], cb);
});

gulp.task('compile', ['clean'], function() {
    //'tsc -t "ES5" --declaration --out "/build/<%1= %jsFileName%>" "<%=base\%tsFileName%" --sourcemap
    return gulp.src(paths.ts_scripts)
        .pipe(foreach(function(stream, file){
            //var jsFileName = file.name.replace(".ts",".js");
            var base = file.path;
            var srcFile = base+'/'+file.name;
            var destFile = 'build/'+file.name;
            return stream
                .pipe(shell([
                    'echo compiling...',
                    'tsc -t "ES5" --declaration --out "/build/test.js" "src/ByteArray.ts"  --sourcemap'
                ]));
        }))
//        .pipe(gulp.dest('build'));
});

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
    gulp.watch(paths.ts_scripts, ['compile']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'compile']);