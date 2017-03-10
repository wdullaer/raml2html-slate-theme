'use strict'
const expect = require('chai').expect
const fs = require('fs')
const rewire = require('rewire')
const themeModule = require('../index.js')

const testModule = rewire('../index.js')

describe('Module exports', () => {
  it('should export a config function', () => {
    expect(themeModule).to.be.a('function')
  })
})

describe('configureTheme()', () => {
  let restore
  let configureTheme = testModule.__get__('configureTheme')

  beforeEach(() => {
    restore = () => {}
  })

  afterEach(() => {
    restore()
  })

  it('should return an object', () => {
    expect(configureTheme()).to.be.an('object')
  })

  it('should return a processRamlObj function', () => {
    expect(configureTheme()).to.have.a.property('processRamlObj').that.is.a('function')
  })

  it('should return a postProcessHtml function', () => {
    expect(configureTheme()).to.have.a.property('postProcessHtml').that.is.a('function')
  })

  it('should return a logoPath string', () => {
    expect(configureTheme()).to.have.a.property('logoPath').that.is.a('string')
  })

  it('should return a colorThemePath string', () => {
    expect(configureTheme()).to.have.a.property('colorThemePath').that.is.a('string')
  })

  it('should default logoPath to DEFAULT_LOGO', () => {
    const DEFAULT_LOGO = testModule.__get__('DEFAULT_LOGO')
    expect(configureTheme()).to.have.a.property('logoPath').to.equal(DEFAULT_LOGO)
  })

  it('should default colorThemePath to DEFAULT_COLOR_THEME', () => {
    const DEFAULT_COLOR_THEME = testModule.__get__('DEFAULT_COLOR_THEME')
    expect(configureTheme()).to.have.a.property('colorThemePath').to.equal(DEFAULT_COLOR_THEME)
  })

  it('should set logoPath to args["logo"]', () => {
    const input = '/foo/bar.png'
    const args = {logo: input}
    expect(configureTheme(args)).to.have.a.property('logoPath').to.equal(input)
  })

  it('should set colorThemePath path to args["color-theme"]', () => {
    const input = '/foo/styl.styl'
    const args = {'color-theme': input}
    expect(configureTheme(args)).to.have.a.property('colorThemePath').to.equal(input)
  })

  it('should write a default theme to stdout and exit when generate-color-theme is set', (done) => {
    let dataWritten = false
    restore = testModule.__set__({
      'process.exit': (exitCode) => {
        expect(exitCode).to.equal(0)
        expect(dataWritten).to.be.true
        done()
      },
      fs: {
        writeSync: (fd, data) => {
          dataWritten = true
          expect(fd).to.equal(1)
          expect(data).to.be.a('string')
        },
        fsyncSync: () => {},
        readFileSync: fs.readFileSync
      }
    })
    const args = {'generate-color-theme': true}
    configureTheme(args)
  })
})

describe('readFile()', () => {
  let readFile = testModule.__get__('readFile')

  it('should return a Promise', () => {
    expect(readFile('/foo')).to.be.an.instanceOf(Promise)
  })

  it('should reject if the file cannot be read', () => {
    return expect(readFile('/foo')).to.be.rejected
  })

  it('should resolve if the file exists', () => {
    return expect(readFile('../index.js')).to.be.resolved
  })
})

describe('getMimeType()', () => {
  let getMimeType = testModule.__get__('getMimeType')
  it('should return `image/png` for an unknown extension', () => {
    expect(getMimeType('foo')).to.equal('image/png')
  })

  it('should return `image/jpeg` for a .jpg extension', () => {
    expect(getMimeType('foo.jpg')).to.equal('image/jpeg')
  })

  it('should return `image/jpeg` for a .jpeg extension', () => {
    expect(getMimeType('foo.jpeg')).to.equal('image/jpeg')
  })

  it('should return `image/png` for a .png extension', () => {
    expect(getMimeType('foo.png')).to.equal('image/png')
  })

  it('should return `image/gif` for a .gif extension', () => {
    expect(getMimeType('foo.gif')).to.equal('image/gif')
  })

  it('should return `image/bmp` for a .bmp extension', () => {
    expect(getMimeType('foo.bmp')).to.equal('image/bmp')
  })

  it('should return `image/tiff` for a .tiff extension', () => {
    expect(getMimeType('foo.tiff')).to.equal('image/tiff')
  })

  it('should return `image/svg+xml` for a .svg extension', () => {
    expect(getMimeType('foo.svg')).to.equal('image/svg+xml')
  })

  it('should be case insensitive', () => {
    expect(getMimeType('foo.JPEG')).to.equal('image/jpeg')
  })
})

describe('loadLogo()', () => {
  let loadLogo = testModule.__get__('loadLogo')

  it('should return a Promise', () => {
    expect(loadLogo()).to.be.an.instanceOf(Promise)
  })

  it('should reject if the logo file does not exist', () => {
    return expect(loadLogo('/foo')).to.be.rejected
  })

  it('should resolve to a string if the logo file does exist', () => {
    const logoPath = testModule.__get__('DEFAULT_LOGO')
    return expect(loadLogo(logoPath)).to.eventually.be.a('string')
  })
})

describe('renderCss()', () => {
  let restore
  let renderCss = testModule.__get__('renderCss')

  beforeEach(() => {
    restore = () => {}
  })

  afterEach(() => {
    restore()
  })

  it('should return a Promise', () => {
    expect(renderCss('/foo')).to.be.an.instanceOf(Promise)
  })

  it('should reject if the theme cannot be read', () => {
    return expect(renderCss('/foo')).to.be.rejected
  })

  it('should reject if stylus encounters an error', () => {
    restore = testModule.__set__('stylus.render', (theme, opts, callback) => {
      return callback(new Error('Test Error'))
    })
    const cssPath = testModule.__get__('templatesPath')
    const stylePath = testModule.__get__('DEFAULT_COLOR_THEME')
    return expect(renderCss(cssPath, stylePath)).to.be.rejected
  })

  it('should resolve to a string if everything goes well', () => {
    const cssPath = testModule.__get__('templatesPath')
    const stylePath = testModule.__get__('DEFAULT_COLOR_THEME')
    return expect(renderCss(cssPath, stylePath)).to.eventually.be.a('string')
  })
})

describe('renderHtml()', () => {
  let renderHtml = testModule.__get__('renderHtml')

  it('should return a string', () => {
    const templatesPath = testModule.__get__('templatesPath')
    expect(renderHtml(templatesPath, {})).to.be.a('string')
  })
})

describe('postProcessHtml()', () => {
  let postProcessHtml = testModule.__get__('postProcessHtml')
  let restore

  beforeEach(() => {
    restore = () => {}
  })

  afterEach(() => {
    restore()
  })

  it('should return a Promise', () => {
    expect(postProcessHtml('foo')).to.be.an.instanceOf(Promise)
  })

  it('should resolve to a String', () => {
    const input = '<html>\n</html>'
    return expect(postProcessHtml(input)).to.eventually.be.a('string')
  })

  it('should reject if the input cannot be minimized', () => {
    restore = testModule.__set__('minimize.parse', (data, callback) => callback(new Error('Test Error')))
    return expect(postProcessHtml()).to.be.rejected
  })
})

describe('processRamlObj()', () => {
  let processRamlObj = testModule.__get__('processRamlObj')

  it('should return a Promise', () => {
    const ramlObj = {foo: 'bar'}
    const config = {bar: 'baz'}

    expect(processRamlObj(ramlObj, config)).to.be.an.instanceOf(Promise)
  })

  it('should resolve to a string', () => {
    const ramlObj = {foo: 'bar'}
    const config = {
      logoPath: testModule.__get__('DEFAULT_LOGO'),
      colorThemePath: testModule.__get__('DEFAULT_COLOR_THEME')
    }

    return expect(processRamlObj(ramlObj, config)).to.eventually.be.a('string')
  })

  it('should reject if there is an issue during the processing', () => {
    const ramlObj = 'foobarred'
    const config = {}

    return expect(processRamlObj(ramlObj, config)).to.be.rejected
  })
})
