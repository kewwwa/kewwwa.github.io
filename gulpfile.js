const { src, dest, series, parallel, watch } = require('gulp'),
    uglify = require('gulp-uglify'),
    scss = require('gulp-scss'),
    cleanCSS = require('gulp-clean-css'),
    browserSync = require('browser-sync').create(),
    del = require('delete');

exports.watch = watchFiles;
exports.build = parallel(javascript, css, copy);
exports.default = series(clean, exports.build, exports.watch);

const config = {
    dest: './docs',
    js: 'index.js',
    css: 'styles.scss',
    copy: ['index.html', 'data.json'],
    del: './docs/**'
};

function watchFiles() {
    browserSync.init({
        server: {
            baseDir: config.dest
        }
    });
    watch(config.js, javascript).on('change', browserSync.reload);
    watch(config.css, css).on('change', browserSync.reload);
    watch(config.copy, copy).on('change', browserSync.reload);
}

function javascript() {
    return src(config.js)
        .pipe(uglify())
        .pipe(dest(config.dest));
}

function css() {
    return src(config.css)
        .pipe(scss())
        .pipe(cleanCSS())
        .pipe(dest(config.dest));
}

function copy() {
    return src(config.copy)
        .pipe(dest(config.dest));
}

function clean(cb) {
    del(config.del, cb);
}