var gulp = require('gulp');

gulp.task('default', function (done) {
    gulp.src('./node_modules/choices.js/public/assets/styles/choices.min.css')
        .pipe(gulp.dest('./assets/dist/css'));
    gulp.src('./node_modules/choices.js/public/assets/scripts/choices.min.js')
        .pipe(gulp.dest('./assets/dist/js'));

    done();
});