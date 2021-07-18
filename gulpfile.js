var gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('default', function (done) {
    gulp.src('./node_modules/choices.js/public/assets/styles/choices.min.css')
        .pipe(gulp.dest('./assets/dist/css'));
    gulp.src('./node_modules/choices.js/public/assets/scripts/choices.min.js')
        .pipe(gulp.dest('./assets/dist/js'));
    gulp.src('js/*.js')
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest('js'))
    done();
});