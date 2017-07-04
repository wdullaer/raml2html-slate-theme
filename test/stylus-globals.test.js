'use strict'
const expect = require('chai').expect
const path = require('path')
const rewire = require('rewire')

const stylusGlobals = require(path.join(__dirname, '../lib/stylus-globals.js'))
const testModule = rewire(path.join(__dirname, '../lib/stylus-globals.js'))

describe('Stylus globals exports', () => {
  it('should export an object', () => {
    expect(stylusGlobals).to.be.an('object')
  })

  it('should export getCurlStatement function', () => {
    expect(stylusGlobals).to.have.property('getCurlStatement').that.is.a('function')
  })

  it('should export getLanguage function', () => {
    expect(stylusGlobals).to.have.property('getLanguage').that.is.a('function')
  })

  it('should export getResponseHeaders function', () => {
    expect(stylusGlobals).to.have.property('getResponseHeaders').that.is.a('function')
  })

  it('should export getSafeId function', () => {
    expect(stylusGlobals).to.have.property('getSafeId').that.is.a('function')
  })
})

describe('getCurlStatement()', () => {
  let getCurlStatement = testModule.__get__('getCurlStatement')

  it('should return a string', () => {
    const baseUri = ''
    const method = {method: 'get'}
    const resource = {}
    expect(getCurlStatement(baseUri, method, resource)).to.be.a('string')
  })

  it('should provide a default value for all components', () => {
    const method = {}
    const resource = {}
    const expected = 'curl -X GET "/"'
    expect(getCurlStatement(undefined, method, resource)).to.equal(expected)
  })

  it('should use the given HTTP method in upper case', () => {
    const baseUri = ''
    const method = {method: 'head'}
    const resource = {}
    const expected = 'curl -X HEAD "/"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should use the given parentUrl', () => {
    const baseUri = ''
    const method = {}
    const resource = {parentUrl: '/foo'}
    const expected = 'curl -X GET "/foo/"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should use the given relativeUri', () => {
    const baseUri = ''
    const method = {}
    const resource = {relativeUri: '/bar/'}
    const expected = 'curl -X GET "/bar/"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should remove a trailing slash from the baseUri', () => {
    const baseUri = 'https://example.com/'
    const method = {}
    const resource = {
      relativeUri: '/foo'
    }
    const expected = 'curl -X GET "https://example.com/foo"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add a query parameter', () => {
    const baseUri = 'https://example.com'
    const method = {
      queryParameters: [{
        key: 'version',
        examples: [{value: '1.0.0'}]
      }]
    }
    const resource = {}
    const expected = 'curl -X GET "https://example.com/?version=1.0.0"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add multiple query parameters', () => {
    const baseUri = 'https://example.com'
    const method = {
      queryParameters: [
        {
          key: 'version',
          examples: [{value: '1.0.0'}]
        },
        {
          key: 'filter',
          examples: [{value: 'true'}]
        }
      ]
    }
    const resource = {}
    const expected = 'curl -X GET "https://example.com/?version=1.0.0&filter=true"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should not add query paramters without examples', () => {
    const baseUri = 'https://example.com'
    const method = {
      queryParameters: [
        {
          key: 'version',
          examples: [{value: '1.0.0'}]
        },
        {
          key: 'foo'
        }
      ]
    }
    const resource = {}
    const expected = 'curl -X GET "https://example.com/?version=1.0.0"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add a header parameter', () => {
    const baseUri = 'https://example.com'
    const method = {
      headers: [{
        key: 'version',
        examples: [{value: '1.0.0'}]
      }]
    }
    const resource = {}
    const expected = 'curl -X GET "https://example.com/" \\\n\t-H "version: 1.0.0"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add multiple header parameters', () => {
    const baseUri = 'https://example.com'
    const method = {
      headers: [
        {
          key: 'version',
          examples: [{value: '1.0.0'}]
        },
        {
          key: 'content-type',
          examples: [{value: 'application/json'}]
        }
      ]
    }
    const resource = {}
    const expected = 'curl -X GET "https://example.com/" \\\n\t-H "version: 1.0.0" \\\n\t-H "content-type: application/json"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should not add header parameters without examples', () => {
    const baseUri = 'https://example.com'
    const method = {
      headers: [
        {
          key: 'version',
          examples: [{value: '1.0.0'}]
        },
        {
          key: 'foo'
        }
      ]
    }
    const resource = {}
    const expected = 'curl -X GET "https://example.com/" \\\n\t-H "version: 1.0.0"'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add a payload if the method is patch', () => {
    const baseUri = 'https://example.com'
    const method = {method: 'patch'}
    const resource = {}
    const expected = 'curl -X PATCH "https://example.com/" \\\n\t-d @request_body'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add a payload if the method is put', () => {
    const baseUri = 'https://example.com'
    const method = {method: 'put'}
    const resource = {}
    const expected = 'curl -X PUT "https://example.com/" \\\n\t-d @request_body'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should add a payload if the method is post', () => {
    const baseUri = 'https://example.com'
    const method = {method: 'post'}
    const resource = {}
    const expected = 'curl -X POST "https://example.com/" \\\n\t-d @request_body'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })

  it('should work with all options combined', () => {
    const baseUri = 'https://example.com'
    const method = {
      method: 'post',
      headers: [{
        key: 'content-type',
        examples: [{value: 'application/json'}]
      }],
      queryParameters: [{
        key: 'version',
        examples: [{value: '1.0.0'}]
      }]
    }
    const resource = {
      parentUrl: '/foo',
      relativeUri: '/bar'
    }
    const expected = 'curl -X POST "https://example.com/foo/bar?version=1.0.0" \\\n\t-H "content-type: application/json" \\\n\t-d @request_body'
    expect(getCurlStatement(baseUri, method, resource)).to.equal(expected)
  })
})

describe('getLanguage()', () => {
  let getLanguage = testModule.__get__('getLanguage')

  it('should return a string when the input is undefined', () => {
    expect(getLanguage()).to.be.a('string')
  })

  it('should return a string when the input is a string', () => {
    expect(getLanguage('langauge')).to.be.a('string')
  })

  it('should return json if the input is application/json', () => {
    const input = 'application/json'
    const expected = 'json'
    expect(getLanguage(input)).to.equal(expected)
  })

  it('should return json if the input mime specifies json as serialisation', () => {
    const input = 'vnd/some.stuff+json'
    const expected = 'json'
    expect(getLanguage(input)).to.equal(expected)
  })

  it('should return xml if the input is application/xml', () => {
    const input = 'application/xml'
    const expected = 'xml'
    expect(getLanguage(input)).to.equal(expected)
  })

  it('should return xml if the input mime specifies xml as serialization', () => {
    const input = 'vnd/some.stuff+xml'
    const expected = 'xml'
    expect(getLanguage(input)).to.equal(expected)
  })

  it('should return sse if the input is text/event-stream', () => {
    const input = 'text/event-stream'
    const expected = 'sse'
    expect(getLanguage(input)).to.equal(expected)
  })

  it('should return an empty string for an unknown mime type', () => {
    const input = 'vnd/some.stuff'
    const expected = ''
    expect(getLanguage(input)).to.equal(expected)
  })
})

describe('getResponseHeaders()', () => {
  let getResponseHeaders = testModule.__get__('getResponseHeaders')

  it('should return an array', () => {
    expect(getResponseHeaders()).to.be.an('array')
  })

  it('should return the empty array if the input has no responses', () => {
    const input = {}
    const expected = []
    expect(getResponseHeaders(input)).to.deep.equal(expected)
  })

  it('should return all headers for a single response', () => {
    const input = {
      responses: [{
        headers: [
          {key: 'foo'},
          {key: 'bar'}
        ]
      }]
    }
    const expected = [{key: 'foo'}, {key: 'bar'}]
    expect(getResponseHeaders(input)).to.deep.equal(expected)
  })

  it('should return all headers for multiple responses', () => {
    const input = {
      responses: [
        {
          headers: [{key: 'foo'}]
        },
        {
          headers: [{key: 'bar'}]
        }
      ]
    }
    const expected = [{key: 'foo'}, {key: 'bar'}]
    expect(getResponseHeaders(input)).to.deep.equal(expected)
  })

  it('should remove duplicate headers', () => {
    const input = {
      responses: [
        {
          headers: [{key: 'foo'}, {key: 'bar'}]
        },
        {
          headers: [{key: 'foo'}, {key: 'bar'}]
        }
      ]
    }
    const expected = [{key: 'foo'}, {key: 'bar'}]
    expect(getResponseHeaders(input)).to.deep.equal(expected)
  })
})

describe('getSafeId', () => {
  let getSafeId = testModule.__get__('getSafeId')

  it('should return a string when input is undefined', () => {
    expect(getSafeId()).to.be.a('string')
  })

  it('should return a string when the input is a string', () => {
    expect(getSafeId('string')).to.be.a('string')
  })

  // TODO: convert these to property based tests
  it('should return a lower case string', () => {
    const input = 'fooBAR'
    expect(getSafeId(input)).to.match(/[a-z0-9]*/)
  })

  it('should return a string without spaces', () => {
    const input = 'foo bar'
    expect(getSafeId(input)).to.equal('foo-bar')
  })
})

describe('hasExamples()', () => {
  const hasExamples = testModule.__get__('hasExamples')

  it('should return a boolean', () => {
    expect(hasExamples()).to.be.a('boolean')
  })

  it('should return false if the input is not an array (undefined)', () => {
    const input = undefined
    expect(hasExamples(input)).to.be.false
  })

  it('should return false if the input is not an array (null)', () => {
    const input = null
    expect(hasExamples(input)).to.be.false
  })

  it('should return false if the input is not an array (object)', () => {
    const input = {foo: 'bar'}
    expect(hasExamples(input)).to.be.false
  })

  it('should return false if none of the elements have an examples property', () => {
    const input = [
      {foo: 'bar'},
      {bar: 'baz'}
    ]
    expect(hasExamples(input)).to.be.false
  })

  it('should return false if none of the elements have an examples property with a non zero length', () => {
    const input = [
      {foo: 'bar'},
      {examples: 1}
    ]
    expect(hasExamples(input)).to.be.false
  })

  it('should return false if all elements have a property examples with a zero length', () => {
    const input = [{examples: []}]
    expect(hasExamples(input)).to.be.false
  })

  it('should return true if the only element has an attribute examples with a nonzero length', () => {
    const input = [{examples: [1]}]
    expect(hasExamples(input)).to.be.true
  })

  it('should return true if all elements have an attribute examples with a nonzero length', () => {
    const input = [
      {examples: [1]},
      {foo: 'bar', examples: [2]}
    ]
    expect(hasExamples(input)).to.be.true
  })

  it('should return true if one element has an attribute examples with a nonzero length', () => {
    const input = [
      {examples: [1]},
      {examples: []}
    ]
    expect(hasExamples(input)).to.be.true
  })
})
