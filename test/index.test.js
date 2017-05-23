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

  it('should default languageTabs to DEFAULT_LANGUAGE_TABS', () => {
    const DEFAULT_LANGUAGE_TABS = testModule.__get__('DEFAULT_LANGUAGE_TABS')
    expect(configureTheme()).to.have.a.property('languageTabs').to.equal(DEFAULT_LANGUAGE_TABS)
  })

  it('should set logoPath to args["logo"]', () => {
    const input = '/foo/bar.png'
    const args = {logo: input}
    expect(configureTheme(args)).to.have.a.property('logoPath').that.equals(input)
  })

  it('should set colorThemePath to args["color-theme"]', () => {
    const input = '/foo/styl.styl'
    const args = {'color-theme': input}
    expect(configureTheme(args)).to.have.a.property('colorThemePath').that.equals(input)
  })

  it('should set languageTabs to args["language-tabs"]', () => {
    const input = ['foo']
    const args = {'language-tabs': input}
    expect(configureTheme(args)).to.have.a.property('languageTabs').that.equals(input)
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
      colorThemePath: testModule.__get__('DEFAULT_COLOR_THEME'),
      languageTabs: ['json', 'xml']
    }

    return expect(processRamlObj(ramlObj, config)).to.eventually.be.a('string')
  })

  it('should reject if there is an issue during the processing', () => {
    const ramlObj = 'foobarred'
    const config = {}

    return expect(processRamlObj(ramlObj, config)).to.be.rejected
  })
})

describe('validateLanguageTabs()', () => {
  let validateLanguageTabs = testModule.__get__('validateLanguageTabs')
  let restore

  beforeEach(() => {
    restore = () => {}
  })

  afterEach(() => {
    restore()
  })

  it('should throw an error if the input is an object', () => {
    const input = {
      foo: 'bar'
    }
    const testFunction = validateLanguageTabs.bind(null, input)

    expect(testFunction).to.throw(TypeError)
  })

  it('should throw an error if the input is a number', () => {
    const input = 1
    const testFunction = validateLanguageTabs.bind(null, input)

    expect(testFunction).to.throw(TypeError)
  })

  it('should throw an error if the input cannot be serialized to json', () => {
    const input = 'foo'
    const testFunction = validateLanguageTabs.bind(null, input)

    expect(testFunction).to.throw(TypeError)
  })

  it('should only handle SyntaxErrors thrown by JSON.parse', () => {
    const stub = () => {
      throw new RangeError('test error')
    }
    restore = testModule.__set__('JSON.parse', stub)
    const input = 'foo'
    const testFunction = validateLanguageTabs.bind(null, input)

    expect(testFunction).to.throw(RangeError, 'test erro')
  })

  it('should throw an error if the input array contains an object', () => {
    const input = ['foo', {bar: 'baz'}]
    const testFunction = validateLanguageTabs.bind(null, input)

    expect(testFunction).to.throw(TypeError)
  })

  it('should throw an error if the input contains a number', () => {
    const input = [1]
    const testFunction = validateLanguageTabs.bind(null, input)

    expect(testFunction).to.throw(TypeError)
  })

  it('should return a parsed array of strings if the input is valid', () => {
    const input = '["xml"]'
    const expected = ['xml']

    expect(validateLanguageTabs(input)).to.deep.equal(expected)
  })

  it('should return an empty array if the input is an empty string', () => {
    const input = ''
    const expected = []

    expect(validateLanguageTabs(input)).to.deep.equal(expected)
  })

  it('should return a parsed array if the input is a valid array', () => {
    const input = ['xml']
    const expected = ['xml']

    expect(validateLanguageTabs(input)).to.deep.equal(expected)
  })

  it('should return an empty array if the input in an empty array', () => {
    const input = []
    const expected = []

    expect(validateLanguageTabs(input)).to.deep.equal(expected)
  })
})
