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
  let securitySchemes

  it('should return a string', () => {
    const baseUri = ''
    const method = {method: 'get'}
    const resource = {}
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.be.a('string')
  })

  it('should provide a default value for all components', () => {
    const method = {}
    const resource = {}
    const expected = 'curl -X GET "/"'
    expect(getCurlStatement(securitySchemes, undefined, method, resource)).to.equal(expected)
  })

  it('should use the given HTTP method in upper case', () => {
    const baseUri = ''
    const method = {method: 'head'}
    const resource = {}
    const expected = 'curl -X HEAD "/"'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should use the given parentUrl', () => {
    const baseUri = ''
    const method = {}
    const resource = {parentUrl: '/foo'}
    const expected = 'curl -X GET "/foo/"'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should use the given relativeUri', () => {
    const baseUri = ''
    const method = {}
    const resource = {relativeUri: '/bar/'}
    const expected = 'curl -X GET "/bar/"'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should remove a trailing slash from the baseUri', () => {
    const baseUri = 'https://example.com/'
    const method = {}
    const resource = {
      relativeUri: '/foo'
    }
    const expected = 'curl -X GET "https://example.com/foo"'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should add a payload if the method is patch', () => {
    const baseUri = 'https://example.com'
    const method = {method: 'patch'}
    const resource = {}
    const expected = 'curl -X PATCH "https://example.com/" \\\n\t-d @request_body'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should add a payload if the method is put', () => {
    const baseUri = 'https://example.com'
    const method = {method: 'put'}
    const resource = {}
    const expected = 'curl -X PUT "https://example.com/" \\\n\t-d @request_body'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should add a payload if the method is post', () => {
    const baseUri = 'https://example.com'
    const method = {method: 'post'}
    const resource = {}
    const expected = 'curl -X POST "https://example.com/" \\\n\t-d @request_body'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
  })

  it('should return a curl command for each security scheme defined for the method', () => {
    const baseUri = 'https://example.com'
    const resource = {
      relativeUri: '/foo'
    }
    const method = {
      method: 'get',
      securedBy: [
        null,
        { schemeName: 'digestAuth' },
        { schemeName: 'customAuth' }
      ]
    }
    securitySchemes = {
      digestAuth: {
        name: 'digestAuth',
        type: 'Digest Authentication'
      },
      customAuth: {
        name: 'customAuth',
        type: 'x-custom',
        describedBy: {
          headers: [
            {
              name: 'X-API-Key',
              type: 'string'
            }
          ]
        }
      }
    }
    const expected = 'curl -X GET "https://example.com/foo"\n\n or \n\ncurl -X GET "https://example.com/foo" \\\n\t--user username:password \\\n\t--digest\n\n or \n\ncurl -X GET "https://example.com/foo" \\\n\t-H "X-API-Key: string"'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource, true)).to.equal(expected)
  })

  it('should return a curl command for the first security scheme defined for the method', () => {
    const baseUri = 'https://example.com'
    const resource = {
      relativeUri: '/foo'
    }
    const method = {
      method: 'get',
      securedBy: [
        { schemeName: 'digestAuth' },
        { schemeName: 'customAuth' }
      ]
    }
    securitySchemes = {
      digestAuth: {
        name: 'digestAuth',
        type: 'Digest Authentication'
      },
      customAuth: {
        name: 'customAuth',
        type: 'x-custom',
        describedBy: {
          headers: [
            {
              name: 'X-API-Key',
              type: 'string'
            }
          ]
        }
      }
    }
    const expected = 'curl -X GET "https://example.com/foo" \\\n\t--user username:password \\\n\t--digest'
    expect(getCurlStatement(securitySchemes, baseUri, method, resource)).to.equal(expected)
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

describe('getTypeDefinitions()', () => {
  const getTypeDefinitions = testModule.__get__('getTypeDefinitions')

  it('should return an empty array if the context is empty', () => {
    const testFn = getTypeDefinitions.bind({})

    expect(testFn()).to.be.an('array').that.is.empty
  })

  it('should return an empty array if the context does not have schemas or types properties', () => {
    const context = {
      ctx: {}
    }
    const testFn = getTypeDefinitions.bind(context)

    expect(testFn()).to.be.an('array').that.is.empty
  })

  it('should return an array of schemas if only schemas are present in the context', () => {
    const context = {
      ctx: {
        schemas: [
          {foo: {type: 'bar'}},
          {bar: {type: 'baz'}}
        ]
      }
    }
    const testFn = getTypeDefinitions.bind(context)
    const expectedOutput = [
      {content: 'bar', type: 'json'},
      {content: 'baz', type: 'json'}
    ]

    expect(testFn()).to.be.an('array').that.deep.equals(expectedOutput)
  })

  it('should return an array of types if only types are present in the context', () => {
    const context = {
      ctx: {
        types: {
          foo: {key: 'bar'},
          bar: {key: 'baz'}
        }
      }
    }
    const testFn = getTypeDefinitions.bind(context)
    const expectedOutput = [{key: 'bar'}, {key: 'baz'}]

    expect(testFn()).to.be.an('array').that.deep.equals(expectedOutput)
  })

  it('should return the types if both schemas and types are present in the context', () => {
    const context = {
      ctx: {
        schemas: [{foo: {key: 'foo'}}],
        types: {
          bar: {key: 'bar'},
          baz: {key: 'baz'}
        }
      }
    }
    const testFn = getTypeDefinitions.bind(context)
    const expectedOutput = [{key: 'bar'}, {key: 'baz'}]

    expect(testFn()).to.be.an('array').that.deep.equals(expectedOutput)
  })

  it('should add a content property to TYPE_EXPRESSION types', () => {
    const context = {
      ctx: {
        types: {
          foo: {
            name: 'myType',
            description: 'description',
            typePropertyKind: 'TYPE_EXPRESSION'
          }
        }
      }
    }
    const testFn = getTypeDefinitions.bind(context)
    const expectedOutput = '{\n  "name": "myType",\n  "description": "description"\n}'

    expect(testFn()[0]).to.have.property('content', expectedOutput)
  })

  it('should add a content property to TYPE_EXPRESSION schemas', () => {
    const context = {
      ctx: {
        schemas: [{
          foo: {
            name: 'myType',
            description: 'description',
            typePropertyKind: 'TYPE_EXPRESSION'
          }
        }]
      }
    }
    const testFn = getTypeDefinitions.bind(context)
    const expectedOutput = '{\n  "name": "myType",\n  "description": "description"\n}'

    expect(testFn()[0]).to.have.property('content', expectedOutput)
  })
})

describe('typeToJson()', () => {
  const typeToJson = testModule.__get__('typeToJson')

  it('should return an object', () => {
    expect(typeToJson({})).to.be.an('object')
  })

  it('should add a content property to the output', () => {
    expect(typeToJson({})).to.have.property('content')
  })

  it('should return an object with the same properties as the input', () => {
    const input = {
      name: 'foo',
      type: 'json'
    }
    const output = typeToJson(input)

    expect(output).to.have.property('name', input.name)
    expect(output).to.have.property('type', input.type)
  })

  it('should return an object with a content property that is a string', () => {
    const input = {
      name: 'foo',
      type: 'json',
      description: 'some text',
      properties: [{key: 'bar'}]
    }
    const expectedOutput = '{\n  "name": "foo",\n  "type": "json",\n  "description": "some text",\n  "properties": [\n    {\n      "key": "bar"\n    }\n  ]\n}'

    expect(typeToJson(input)).to.have.property('content').that.is.a('string').and.equals(expectedOutput)
  })
})

describe('hasType()', () => {
  const hasType = testModule.__get__('hasType')

  it('should return true if the input has a schema property', () => {
    const input = {schema: 'foo'}

    expect(hasType(input)).to.be.true
  })

  it('should return true if the input has a type property', () => {
    const input = {type: 'foo'}

    expect(hasType(input)).to.be.true
  })

  it('should return true if the input has both type and schema properties', () => {
    const input = {
      type: 'foo',
      schema: 'bar'
    }

    expect(hasType(input)).to.be.true
  })

  it('should return false if the input has neither type nor schema as a property', () => {
    const input = {foo: 'bar'}

    expect(hasType(input)).to.be.false
  })

  it('should return false if the input is undefined', () => {
    expect(hasType()).to.be.false
  })

  it('should return false if the input is a string', () => {
    const input = 'foo'

    expect(hasType(input)).to.be.false
  })
})

describe('getschema()', () => {
  const getType = testModule.__get__('getType')

  it('should return a string', () => {
    expect(getType()).to.be.an('string')
  })

  it('should return an empty string if the input does not have a type or schema', () => {
    const input = {foo: 'bar'}
    const expectedOutput = ''

    expect(getType(input)).to.equal(expectedOutput)
  })

  it('should return the type property if it is a string', () => {
    const input = {type: 'foo'}
    const expectedOutput = 'foo'

    expect(getType(input)).to.equal(expectedOutput)
  })

  it('should return the schema property if it is a string', () => {
    const input = {schema: 'foo'}
    const expectedOutput = 'foo'

    expect(getType(input)).to.equal(expectedOutput)
  })

  it('should return the type if both schema and type are present', () => {
    const input = {
      type: 'foo',
      schema: 'bar'
    }
    const expectedOutput = 'foo'

    expect(getType(input)).to.equal(expectedOutput)
  })

  it('should return the first element if the type is an array', () => {
    const input = {type: ['foo', 'bar']}
    const expectedOutput = 'foo'

    expect(getType(input)).to.equal(expectedOutput)
  })

  it('should return a string if the type is an object', () => {
    const input = {type: {foo: 'bar'}}
    const expectedOutput = '{\n  "foo": "bar"\n}'

    expect(getType(input)).to.equal(expectedOutput)
  })
})
