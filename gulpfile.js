'use strict';

// check if gulp dist was called
if (process.argv.indexOf('dist') !== -1) {
    // add ship options to command call
    process.argv.push('--ship');
}

const path = require('path');
const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const gulpSequence = require('gulp-sequence');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Create clean distrubution package
gulp.task('dist', gulpSequence('clean', 'bundle', 'package-solution'));
// Create clean development package
gulp.task('dev', gulpSequence('clean', 'bundle', 'package-solution'));

// Versioning - BEGIN
const gutil = require('gulp-util');
const fs = require('fs');

gulp.task('version-sync', function() {
  // read package.json
  var pkgConfig = require('./package.json');

  // read configuration of web part solution file
  var pkgSolution = require('./config/package-solution.json');

  // log old version
  gutil.log('Old Version:\t' + pkgSolution.solution.version);

  // Generate new MS compliant version number
  var newVersionNumber = pkgConfig.version.split('-')[0] + '.0';

  // assign newly generated version number to web part version
  pkgSolution.solution.version = newVersionNumber;

  // log new version
  gutil.log('New Version:\t' + pkgSolution.solution.version);

  // write changed package-solution file
  fs.writeFile('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4));
});

var getJson = function(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

let bumpRevisionSubTask = build.subTask('bump-revision-subtask', function(gulp, buildOptions, done) {
  var skipBumpRevision = buildOptions.args['revision'] === false;
  if (!skipBumpRevision) {
    var pkgSolution = getJson('./config/package-solution.json');
    var oldVersionNumber = String(pkgSolution.solution.version);
    gutil.log('Old Version: ' + oldVersionNumber);
    var oldBuildNumber = parseInt(oldVersionNumber.split('.')[3]);
    gutil.log('Old Build Number: ' + oldBuildNumber);
    var newBuildNumber = oldBuildNumber + 1;
    gutil.log('New Build Number: ' + newBuildNumber);
    var newVersionNumber =
      oldVersionNumber.substring(0, String(oldVersionNumber).length - String(oldBuildNumber).length) +
      String(newBuildNumber);
    gutil.log('New Version: ' + newVersionNumber);
    pkgSolution.solution.version = newVersionNumber;
    fs.writeFile('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4), err => {
      if (err) {
        return console.log(err);
      }
    }); // Callback added for Node 10
  }
  return gulp.src('./config/package-solution.json').pipe(skipBumpRevision ? gutil.noop() : gulp.dest('./config'));
});

let bumpRevisionTask = build.task('bump-revision', bumpRevisionSubTask);

build.rig.addPreBuildTask(bumpRevisionTask);

// Versioning - END

/**
 * Webpack Bundle Anlayzer
 * Reference and gulp task
 */
const bundleAnalyzer = require('webpack-bundle-analyzer');

build.configureWebpack.mergeConfig({

    additionalConfiguration: (generatedConfiguration) => {
        const lastDirName = path.basename(__dirname);
        const dropPath = path.join(__dirname, 'temp', 'stats');
        generatedConfiguration.plugins.push(new bundleAnalyzer.BundleAnalyzerPlugin({
            openAnalyzer: false,
            analyzerMode: 'static',
            reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
            generateStatsFile: true,
            statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
            logLevel: 'error'
        }));

        return generatedConfiguration;
    }

});


/**
 * StyleLinter configuration
 * Reference and custom gulp task
 */
const stylelint = require('gulp-stylelint');

/* Stylelinter sub task */
let styleLintSubTask = build.subTask('stylelint', (gulp) => {

    console.log('[stylelint]: By default style lint errors will not break your build. If you want to change this behaviour, modify failAfterError parameter in gulpfile.js.');

    return gulp
        .src('src/**/*.scss')
        .pipe(stylelint({
            failAfterError: false,
            reporters: [{
                formatter: 'string',
                console: true
            }]
        }));
});
/* end sub task */

build.rig.addPreBuildTask(styleLintSubTask);

/**
 * Custom Framework Specific gulp tasks
 */


build.initialize(gulp);
