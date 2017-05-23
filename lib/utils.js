'use strict'
const fs = require('fs')
const path = require('path')

/**
 * Guess the MIME type of a file based on extension. Uses `image/png` by default
 * @param  {string} filePath Path of the filePath
 * @return {string}          The MIME type of the file
 */
function getMimeType (filePath) {
  const pathInfo = path.parse(filePath)
  switch (pathInfo.ext.toLowerCase()) {
    case '.bmp':
      return 'image/bmp'
    case '.svg':
      return 'image/svg+xml'
    case '.tiff':
      return 'image/tiff'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.png':
    default:
      return 'image/png'
  }
}

/**
 * Promisified version of fs.readFile
 * @param  {string}          path The path of the file to readFile
 * @return {Promise<Buffer>}      A Promise resolving to a buffer with the file content
 */
function readFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, content) => err ? reject(err) : resolve(content))
  })
}

/**
 * Log an error and stop processing
 * Will throw an error if we're running as a library in a custom script
 * Will exit the process if we're running as a command line program
 * TODO: generalize this into a more general logging function
 * @param {string}       bin The name of the binary that is using this library
 * @param {array|string} arg The user supplied value of the argument that fails validation
 */
function logAndExit (bin, arg) {
  console.error(`language-tabs argument "${JSON.stringify(arg)}" is invalid`)
  console.error('language-tabs argument should be a JSON array of strings. eg: ["json", "xml"]')

  if (path.basename(process.argv[1]) === bin) {
    // We are most likely running from the CLI
    // Kill the process
    process.exit(1)
  } else {
    // We are most likely running embedded as a library
    // Throw an error
    throw new TypeError(`language-tabs argument "${JSON.stringify(arg)}" is invalid`)
  }
}

module.exports = {
  getMimeType,
  logAndExit,
  readFile
}
