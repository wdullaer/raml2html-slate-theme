'use strict'
const expect = require('chai').expect
const path = require('path')
const rewire = require('rewire')
const utilsModule = require(path.join(__dirname, '../lib/utils.js'))

const testModule = rewire(path.join(__dirname, '../lib/utils.js'))

describe('Utils exports', () => {
  it('should export a config function', () => {
    expect(utilsModule).to.be.an('object')
  })

  it('should export a readFile function', () => {
    expect(utilsModule).to.have.a.property('readFile')
      .that.is.a('function')
  })

  it('should export a logAndExit function', () => {
    expect(utilsModule).to.have.a.property('logAndExit')
      .that.is.a('function')
  })

  it('should export a getMimeType function', () => {
    expect(utilsModule).to.have.a.property('getMimeType')
      .that.is.a('function')
  })
})

describe('readFile()', () => {
  const readFile = testModule.__get__('readFile')

  it('should return a Promise', () => {
    const prom = readFile('/foo')
    prom.catch(() => {})
    expect(prom).to.be.an.instanceOf(Promise)
  })

  it('should reject if the file cannot be read', () => {
    return expect(readFile('/foo')).to.be.rejected
  })

  it('should resolve if the file exists', () => {
    return expect(readFile(path.join(__dirname, './utils.test.js'))).to.be.fulfilled
  })
})

describe('getMimeType()', () => {
  const getMimeType = testModule.__get__('getMimeType')
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

describe('logAndExit()', () => {
  const logAndExit = testModule.__get__('logAndExit')
  let restore

  beforeEach(() => {
    restore = () => {}
  })

  afterEach(() => {
    restore()
  })

  it('should log a message to console.error', () => {
    let called = false
    const mock = (arg) => {
      called = true
      expect(arg).to.be.a('string')
    }
    const binName = 'raml2html'
    const arg = 'foo'

    restore = testModule.__set__({
      console: {
        error: mock
      }
    })

    try {
      logAndExit(binName, arg)
    } catch (e) {}

    expect(called).to.be.true
  })

  it('should exit with an exit-code of 1 if we are running as a commandline binary', () => {
    let called = false
    const mock = (arg) => {
      called = true
      expect(arg).to.equal(1)
    }
    const binName = 'raml2html'
    const arg = 'foo'

    restore = testModule.__set__({
      process: {
        argv: ['/foo', binName],
        exit: mock
      }
    })

    logAndExit(binName, arg)

    expect(called).to.be.true
  })

  it('should throw a TypeError if we are running as a library', () => {
    const binName = 'foo'
    const arg = 'bar'
    const testFunction = logAndExit.bind(null, binName, arg)

    expect(testFunction).to.throw(TypeError)
  })
})
