'use strict'
const expect = require('chai').expect
const path = require('path')
const rewire = require('rewire')

const curlCommandBuilder = require(path.join(__dirname, '../lib/curl-command-builder.js'))
const testModule = rewire(path.join(__dirname, '../lib/curl-command-builder.js'))

describe('curl command builder exports', () => {
  it('should export an object', () => {
    expect(curlCommandBuilder).to.be.an('object')
  })

  it('should export forMethod function', () => {
    expect(curlCommandBuilder).to.have.property('forMethod').that.is.a('function')
  })
})

describe('curlOAuth2', () => {
  let curlOAuth2 = testModule.__get__('curlOAuth2')
  let securityScheme, result

  it('returns an array with an entry for the header', () => {
    securityScheme = {
      describedBy: {
        headers: [
          {
            name: 'Authorization',
            type: 'string'
          }
        ]
      }
    }

    result = curlOAuth2(securityScheme)
    expect(result).to.be.an('array').and.deep.equal([{
      headers: ['-H "Authorization: Bearer string"']
    }])
  })

  it('returns an array with an entry for the query string', () => {
    securityScheme = {
      describedBy: {
        queryParameters: [
          {
            name: 'access_token',
            type: 'string'
          }
        ]
      }
    }

    result = curlOAuth2(securityScheme)
    expect(result).to.be.an('array').and.deep.equal([{
      params: ['access_token=string']
    }])
  })

  it('returns an array with an entry for both the header and the query string', () => {
    securityScheme = {
      describedBy: {
        headers: [
          {
            name: 'Authorization',
            type: 'string'
          }
        ],
        queryParameters: [
          {
            name: 'access_token',
            type: 'string'
          }
        ]
      }
    }

    result = curlOAuth2(securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: ['-H "Authorization: Bearer string"']
      },
      {
        params: ['access_token=string']
      }
    ])
  })
})

describe('curlOAuth1', () => {
  let curlOAuth1 = testModule.__get__('curlOAuth1')
  let securityScheme, result

  it('when a signature scheme is provided, returns an array with an entry for the header and for the query string', () => {
    securityScheme = {
      name: 'oauth1',
      type: 'OAuth 1.0',
      settings: {
        signatures: ['HMAC-SHA1']
      }
    }

    result = curlOAuth1(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: ['-H \'Authorization: OAuth realm="API",\\\n\toauth_consumer_key="consumer_key",\\\n\toauth_token="token",\\\n\toauth_signature_method="HMAC-SHA1",\\\n\toauth_signature="computed_signature",\\\n\toauth_timestamp="timestamp",\\\n\toauth_nonce="nonce",\\\n\toauth_version="1.0"\'']
      },
      {
        params: [
          'oauth_consumer_key=consumer_key',
          'oauth_token=token',
          'oauth_signature_method=HMAC-SHA1',
          'oauth_signature=computed_signature',
          'oauth_timestamp=timestamp',
          'oauth_nonce=nonce',
          'oauth_version=1.0'
        ]
      }
    ])
  })

  it('when a signature scheme is NOT provided, returns an array with an entry for the header and for the query string', () => {
    securityScheme = {
      name: 'oauth1',
      type: 'OAuth 1.0'
    }

    result = curlOAuth1(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: ['-H \'Authorization: OAuth realm="API",\\\n\toauth_consumer_key="consumer_key",\\\n\toauth_token="token",\\\n\toauth_signature_method="RSA-SHA1",\\\n\toauth_signature="computed_signature",\\\n\toauth_timestamp="timestamp",\\\n\toauth_nonce="nonce",\\\n\toauth_version="1.0"\'']
      },
      {
        params: [
          'oauth_consumer_key=consumer_key',
          'oauth_token=token',
          'oauth_signature_method=RSA-SHA1',
          'oauth_signature=computed_signature',
          'oauth_timestamp=timestamp',
          'oauth_nonce=nonce',
          'oauth_version=1.0'
        ]
      }
    ])
  })
})

describe('curlBasicAuth', () => {
  let curlBasicAuth = testModule.__get__('curlBasicAuth')
  let securityScheme, result

  it('returns an array with a single command line option', () => {
    securityScheme = {
      name: 'basicAuth',
      type: 'Basic Authentication'
    }

    result = curlBasicAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      { options: ['--user username:password'] }
    ])
  })
})

describe('curlDigestAuth', () => {
  let curlDigestAuth = testModule.__get__('curlDigestAuth')
  let securityScheme, result

  it('returns an array with a single command line option', () => {
    securityScheme = {
      name: 'digestAuth',
      type: 'Digest Authentication'
    }

    result = curlDigestAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        options: ['--user username:password', '--digest']
      }
    ])
  })
})

describe('curlPassThroughAuth', () => {
  let curlPassThroughAuth = testModule.__get__('curlPassThroughAuth')
  let securityScheme, result

  it('adds headers and query string parameters for every entry in the scheme', () => {
    securityScheme = {
      name: 'passThrough',
      type: 'Pass Through',
      describedBy: {
        headers: [
          {
            name: 'X-Auth',
            type: 'string'
          },
          {
            name: 'X-Auth-Again',
            type: 'string'
          }
        ],
        queryParameters: [
          {
            name: 'auth_token',
            type: 'string'
          }
        ]
      }
    }

    result = curlPassThroughAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [
          '-H "X-Auth: string"',
          '-H "X-Auth-Again: string"'
        ],
        params: [
          'auth_token=string'
        ]
      }
    ])
  })

  it("doesn't choke when no headers are present", () => {
    securityScheme = {
      name: 'passThrough',
      type: 'Pass Through',
      describedBy: {
        queryParameters: [
          {
            name: 'auth_token',
            type: 'string'
          }
        ]
      }
    }

    result = curlPassThroughAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [],
        params: [
          'auth_token=string'
        ]
      }
    ])
  })

  it('uses the example provided for the query parameter', () => {
    securityScheme = {
      name: 'passThrough',
      type: 'Pass Through',
      describedBy: {
        queryParameters: [
          {
            name: 'auth_token',
            type: 'string',
            examples: [
              {
                value: 'QWERTYUIOP',
                name: null
              }
            ]
          }
        ]
      }
    }

    result = curlPassThroughAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [],
        params: [
          'auth_token=QWERTYUIOP'
        ]
      }
    ])
  })

  it("doesn't choke when no query string parameters are present", () => {
    securityScheme = {
      name: 'passThrough',
      type: 'Pass Through',
      describedBy: {
        headers: [
          {
            name: 'X-Auth',
            type: 'string'
          },
          {
            name: 'X-Auth-Again',
            type: 'string'
          }
        ]
      }
    }

    result = curlPassThroughAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [
          '-H "X-Auth: string"',
          '-H "X-Auth-Again: string"'
        ],
        params: []
      }
    ])
  })

  it('uses the example provided for the headers', () => {
    securityScheme = {
      name: 'passThrough',
      type: 'Pass Through',
      describedBy: {
        headers: [
          {
            name: 'Authorization',
            type: 'string',
            examples: [
              {
                value: 'Bearer QWERYTUIOP',
                name: null
              }
            ]
          }
        ]
      }
    }

    result = curlPassThroughAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [
          '-H "Authorization: Bearer QWERYTUIOP"'
        ],
        params: []
      }
    ])
  })
})

describe('curlXCustomAuth', () => {
  let curlXCustomAuth = testModule.__get__('curlXCustomAuth')
  let securityScheme, result

  it('adds headers for every entry in the scheme', () => {
    securityScheme = {
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

    result = curlXCustomAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [
          '-H "X-API-Key: string"'
        ]
      }
    ])
  })

  it('uses an example when provided', () => {
    securityScheme = {
      name: 'customAuth',
      type: 'x-custom',
      describedBy: {
        headers: [
          {
            name: 'X-API-Key',
            type: 'string',
            examples: [
              {
                name: 'apikey',
                value: 'QWERTYUIOP'
              }
            ]
          }
        ]
      }
    }

    result = curlXCustomAuth(securityScheme)

    expect(result).to.be.an('array').and.deep.equal([
      {
        headers: [
          '-H "X-API-Key: QWERTYUIOP"'
        ]
      }
    ])
  })
})

describe('curlNullAuth', () => {
  let curlNullAuth = testModule.__get__('curlNullAuth')
  let result

  it('returns an array with an empty object', () => {
    result = curlNullAuth()
    expect(result).to.be.an('array').and.deep.equal([{}])
  })
})

describe('buildCurlCommands', () => {
  let buildCurlCommands = testModule.__get__('buildCurlCommands')
  let methodParams = {
    method: 'post',
    baseUri: 'https://api.example.com',
    path: '/foo',
    params: [
      'bar=baz',
      'bow=wow'
    ],
    headers: [
      '-H "X-Foo: Bar"',
      '-H "X-Bar: Baz"'
    ],
    payload: ' \\\n\t-d @request_body'
  }
  let securityScheme, result

  it('builds the correct curl command when no security scheme is provided', () => {
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-d @request_body'
    ])
  })

  it('builds the correct curl command when an x-other security scheme is provided', () => {
    securityScheme = {
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
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-H "X-API-Key: string" \\\n\t-d @request_body'
    ])
  })

  it('builds the correct curl command when a security scheme starting with x- is provided', () => {
    securityScheme = {
      name: 'whateverAuth',
      type: 'x-whatever',
      describedBy: {
        headers: [
          {
            name: 'Whatever',
            type: 'string'
          }
        ]
      }
    }
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-H "Whatever: string" \\\n\t-d @request_body'
    ])
  })

  it('builds the correct curl command when na pass through secuity scheme is provided', () => {
    securityScheme = {
      name: 'passThrough',
      type: 'Pass Through',
      describedBy: {
        headers: [
          {
            name: 'X-Auth',
            type: 'string'
          },
          {
            name: 'X-Auth-Again',
            type: 'string'
          }
        ],
        queryParameters: [
          {
            name: 'auth_token',
            type: 'string'
          }
        ]
      }
    }
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow&auth_token=string" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-H "X-Auth: string" \\\n\t-H "X-Auth-Again: string" \\\n\t-d @request_body'
    ])
  })

  it('builds the correct curl command when a digest security scheme is provided', () => {
    securityScheme = {
      name: 'digestAuth',
      type: 'Digest Authentication'
    }
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-d @request_body \\\n\t--user username:password \\\n\t--digest'
    ])
  })

  it('builds the correct curl command when a basic security scheme is provided', () => {
    securityScheme = {
      name: 'basicAuth',
      type: 'Basic Authentication'
    }
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-d @request_body \\\n\t--user username:password'
    ])
  })

  it('builds the correct set of curl commands when an OAuth 1 security scheme is provided', () => {
    securityScheme = {
      name: 'oauth1',
      type: 'OAuth 1.0',
      settings: {
        signatures: ['HMAC-SHA1']
      }
    }
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-H \'Authorization: OAuth realm="API",\\\n\toauth_consumer_key="consumer_key",\\\n\toauth_token="token",\\\n\toauth_signature_method="HMAC-SHA1",\\\n\toauth_signature="computed_signature",\\\n\toauth_timestamp="timestamp",\\\n\toauth_nonce="nonce",\\\n\toauth_version="1.0"\' \\\n\t-d @request_body',
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow&oauth_consumer_key=consumer_key&oauth_token=token&oauth_signature_method=HMAC-SHA1&oauth_signature=computed_signature&oauth_timestamp=timestamp&oauth_nonce=nonce&oauth_version=1.0" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-d @request_body'
    ])
  })

  it('builds the correct set of curl commands when an OAuth 2 security scheme is provided', () => {
    securityScheme = {
      name: 'oauth2',
      type: 'OAuth 2.0',
      describedBy: {
        headers: [
          {
            name: 'Authorization',
            type: 'string'
          }
        ],
        queryParameters: [
          {
            name: 'access_token',
            type: 'string'
          }
        ]
      }
    }
    result = buildCurlCommands(methodParams, securityScheme)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-H "Authorization: Bearer string" \\\n\t-d @request_body',
      'curl -X POST "https://api.example.com/foo?bar=baz&bow=wow&access_token=string" \\\n\t-H "X-Foo: Bar" \\\n\t-H "X-Bar: Baz" \\\n\t-d @request_body'
    ])
  })
})

describe('forMethod', () => {
  let forMethod = testModule.__get__('forMethod')
  let securitySchemes = {
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
  let methodParams, result

  it('builds a secured curl command when the method is secured by a matching defined scheme', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [
        { schemeName: 'customAuth' }
      ]
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo" \\\n\t-H "X-API-Key: string"'
    ])
  })

  it('builds multiple secured curl commands when the method is secured by multiple matching defined schemes', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [
        { schemeName: 'customAuth' },
        { schemeName: 'digestAuth' }
      ]
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo" \\\n\t-H "X-API-Key: string"',
      'curl -X GET "https://api.example.com/foo" \\\n\t--user username:password \\\n\t--digest'
    ])
  })

  it('builds a single secured curl command when the method is secured by multiple schemes, but only one matches the defined schemes', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [
        { schemeName: 'customAuth' },
        { schemeName: 'notDefined' }
      ]
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo" \\\n\t-H "X-API-Key: string"'
    ])
  })

  it('builds both an unsecured and a secured curl command when the method is secured by a matching defined scheme and explicitly unsecured', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [
        null,
        { schemeName: 'customAuth' }
      ]
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo"',
      'curl -X GET "https://api.example.com/foo" \\\n\t-H "X-API-Key: string"'
    ])
  })

  it('builds an unsecured curl command when the method is secured by a null scheme', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [null]
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo"'
    ])
  })

  it('builds an unsecured curl command when the method is explicitly not secured', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: []
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo"'
    ])
  })

  it('builds an unsecured curl command when the method is secured, but no security schemes are defined', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [
        { schemeName: 'oauth2' }
      ]
    }
    result = forMethod(methodParams, undefined)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo"'
    ])
  })

  it('builds an unsecured curl command when the method is secured, but no matching security schemes are defined', () => {
    methodParams = {
      method: 'get',
      baseUri: 'https://api.example.com',
      path: '/foo',
      headers: [],
      params: [],
      payload: '',
      securedBy: [
        { schemeName: 'oauth2' }
      ]
    }
    result = forMethod(methodParams, securitySchemes)
    expect(result).to.be.an('array').and.deep.equal([
      'curl -X GET "https://api.example.com/foo"'
    ])
  })
})
