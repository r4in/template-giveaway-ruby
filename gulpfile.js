// basic gulp package
var gulp = require("gulp");

// for watching sass files
var sass = require("gulp-sass");

// for working on sass globs on the component folder
var sassGlob = require("gulp-sass-glob");

// sourcemaps for to trace which sass file
var sourcemaps = require("gulp-sourcemaps");

// for autoprefixing
var autoprefixer = require("gulp-autoprefixer");

// for live reloading
var browserSync = require("browser-sync").create();

// minifying images
var imagemin = require("gulp-imagemin");

// minifying css
var cssnano = require("gulp-cssnano");

// minify html
var htmlmin = require("gulp-htmlmin");

//concatenates any number of CSS and JavaScript files into a single file
var useref = require("gulp-useref");

// minifying JavaScript files
var uglify = require("gulp-uglify-es").default;

// caching images when optimizing
var cache = require("gulp-cache");

// cleans dist folder for every build run
var del = require("del");

// runs gulp tasks in specified order
var runSequence = require("run-sequence");

// gulp utility
var gulpIf = require("gulp-if");

// determine critical css
var criticalCss = require("gulp-critical-css");

// image compression task
gulp.task("images", function() {
  return (
    gulp
      .src("app/img/**/*.+(png|jpg|jpeg|gif)")
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin({
            interlaced: true
          })
        )
      )
      .pipe(gulp.dest("dist/img"))
  );
});

// copy svgs
gulp.task("svg", function() {
  return gulp.src("app/img/**/*.svg").pipe(gulp.dest("dist/img"));
});

// copy fonts to production folder
gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));
});

// copy favicon to production folder
gulp.task("favicon", function() {
  return gulp.src("app/*.ico").pipe(gulp.dest("dist"));
});

// copy js to production folder
gulp.task("js", function() {
  return gulp.src("app/js/**/*").pipe(gulp.dest("dist/js"));
});

// watch for changes in sass files
gulp.task("watch", ["browserSync", "sass"], function() {
  gulp.watch("app/scss/*.scss", ["sass"]).on("change", browserSync.reload);
  gulp.watch("app/scss/**/*.scss", ["sass"]).on("change", browserSync.reload);
  gulp.watch("app/*.html", browserSync.reload);
  gulp.watch("app/js/**/*.js", browserSync.reload);
});

// build your site
gulp.task("build", function(callback) {
  runSequence(
    "clean:dist",
    "sass",
    ["useref", "images", "svg", "fonts", "favicon", "js"],
    "critical",
    callback
  );
  console.log("Building our awesome site yo!");
});

gulp.task("default", function(callback) {
  runSequence(["sass", "browserSync", "watch"], callback);
});

gulp.task("clean:dist", function() {
  return del.sync("dist");
});

gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: "app"
    }
  });
});

gulp.task("sass", function() {
  return gulp
    .src("app/scss/**/*.scss")
    .pipe(sourcemaps.init()) // Initialize sourcemap plugin
    .pipe(sassGlob()) // Accepts file globbing
    .pipe(sass()) // Converts Sass
    .pipe(autoprefixer({ browsers: ["last 2 versions"], cascade: false })) // Adds Prefixes for Crossbrowser support
    .pipe(sourcemaps.write("./maps")) // Writes sourcemap
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("useref", function() {
  return (
    gulp
      .src("app/*.html")
      .pipe(useref())
      //minifies only if js file
      .pipe(gulpIf("*.js", uglify()))
      //minifies only if css file
      .pipe(gulpIf("*.css", cssnano()))
      .pipe(gulp.dest("dist"))
  );
});

gulp.task("minify", function() {
  return gulp
    .src("app/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"));
});

gulp.task("critical", function() {
  return gulp
    .src("dist/css/main.min.css")
    .pipe(criticalCss())
    .pipe(gulp.dest("dist/css"));
});
