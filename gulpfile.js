const { src, dest, series, parallel, watch } = require('gulp'),
    { pipeline } = require('stream'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    scss = require('gulp-scss'),
    cleanCSS = require('gulp-clean-css'),
    browserSync = require('browser-sync').create(),
    del = require('delete');

exports.build = parallel(javascript, css, copy);
exports.clean = clean;
exports.watch = watchFiles;
exports.default = series(clean, exports.build, exports.watch);

const config = {
    dest: './docs',
    js: 'index.js',
    css: 'styles.scss',
    copy: ['index.html', 'data.json', 'CNAME', '*.pdf'],
    del: './docs/**/*'
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

function javascript(cb) {
    return pipeline(
        src(config.js),
        sourcemaps.init(),
        babel({
            presets: ['@babel/env']
        }),
        uglify(),
        sourcemaps.write('.'),
        dest(config.dest),
        cb
    );
}

function css(cb) {
    return pipeline(
        src(config.css),
        scss(),
        cleanCSS(),
        dest(config.dest),
        cb
    );
}

function copy(cb) {
    return pipeline(
        src(config.copy),
        dest(config.dest),
        cb
    );
}

function clean(cb) {
    del(config.del, cb);
}