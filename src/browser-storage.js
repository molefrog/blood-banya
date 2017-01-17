class BrowserStorage {
  constructor () {
    this.browsers = {}
  }

  retrieve (ref) {
    return this.browsers[ref]
  }

  pop (ref) {
    const value = this.browsers[ref]
    this.browsers[ref] = undefined
    return value
  }

  push (browser) {
    const ref = Symbol()

    this.browsers[ref] = {
      browser,
      context: {}
    }

    return ref
  }
}

module.exports = BrowserStorage
