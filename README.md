# raml2html-slate-theme [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

> Render the RAML API spec in the slate documentation layout using raml2html

This package provides a theme for [raml2html](https://github.com/raml2html/raml2html). It is meant to render nice looking documentation for your REST API, based on a RAML file.
The theme is is inspired by [slate](https://github.com/lord/slate).

The theme is usable, but the templates might still change based upon feedback. Not all RAML features are currently supported.

![Example](https://raw.github.com/wdullaer/raml2slate/gh-pages/example-image.png)

## Installation

```sh
$ npm install -g raml2html-slate-theme
```

## Usage
In javascript:
```js
const raml2html = require('raml2html');
const options = {
  logo: '/path/to/my/logo.png',
  'color-theme': 'path/to/my/color-theme.styl'
}
const slateConfig = raml2html.getConfigForTheme('raml2html-slate-theme', options);

// source can be a filename, url or parsed RAML object
const source = 'path/to/raml/file'
raml2html.render(source, slateConfig)
  .then((html) => console.log(html))
  .catch((error) => console.error(error))
```

On the command line:
```bash
raml2html \
--theme 'raml2html-slate-theme' \
-o 'path/to/output/file.html' \
-i 'path/to/raml/file.raml'
```

## Options

* *--logo* The path to a custom logo
* *--color-theme* The path to a custom color-theme stylus file
* *--generate-color-theme* Writes the default color them to stdout and exits. Ideal as a starting point for your own color scheme

## TODO
* Add schema definitions to the template
* Cover all RAML features
* Make better use of the language tabs at the top

## License

MIT © [Wouter Dullaert](https://wdullaer.com)


[npm-image]: https://badge.fury.io/js/raml2html-slate-theme.svg
[npm-url]: https://npmjs.org/package/raml2html-slate-theme
[travis-image]: https://travis-ci.org/wdullaer/raml2html-slate-theme.svg?branch=master
[travis-url]: https://travis-ci.org/wdullaer/raml2html-slate-theme
[daviddm-image]: https://david-dm.org/wdullaer/raml2html-slate-theme.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/wdullaer/raml2html-slate-theme
[greenkeeper-image]: https://badges.greenkeeper.io/wdullaer/raml2html-slate-theme.svg
[greenkeeper-url]: https://greenkeeper.io/
