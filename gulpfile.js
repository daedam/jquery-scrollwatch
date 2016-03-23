var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var del = require('del');
var $ = gulpLoadPlugins();

gulp.task('build:full', function () {
    return gulp.src('src/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build:min', function () {
    return gulp.src('src/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.uglify({ 'preserveComments': 'license' }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build:full', 'build:min']);

gulp.task('clean', del.bind(null, ['dist/*']));

gulp.task('default', ['clean', 'build']);