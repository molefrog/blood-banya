const bodyParser = require('body-parser')
const express = require('express')
const Nightmare = require('nightmare')
const genericPool = require('generic-pool')

const isProduction = process.env.NODE_ENV === 'production'

// The pool has problems storing Nightmare objects,
// so we put references to browsers in the store instead
const BrowserStorage = require('./browser-storage')
const storage = new BrowserStorage()

const log = require('stupid-log').for('📷 ')

const poolOptions = {
  max: 10,
  min: 1
}

const browserPool = genericPool.createPool({
  create: async function () {
    log('Allocating new browser in the pool')

    const client = Nightmare({
      show: !isProduction
    })
    return storage.push(client)
  },

  destroy: async function (ref) {
    log('Destroying browser instance...')

    const { browser } = storage.pop(ref)
    await browser.end()
  }
}, poolOptions)

const app = express()
app.use(bodyParser.json())

app.get('*', async (req, response) => {
  try {
    const { width, height, path } = req.query

    if (!path) {
      throw new Error('`path` parameter is missing.')
    }

    log(`Snapshot request ${path}`)

    const browserRef = await browserPool.acquire()
    let { browser, context } = storage.retrieve(browserRef)

    // Set the browser's viewport
    let step = browser.viewport(
      Number(width || 1024),
      Number(height || 768))

    // Nightmare.js behaves weird if goto() called with
    // the same page as before (sometimes it doesn't fire goto
    // end event and returns with a timeout).
    //
    // In order to fix it we save the last visited page and
    // reload the browser.
    if (context.lastPath && context.lastPath === path) {
      step = step.refresh()
    } else {
      step = step.goto(path)
    }

    // The `waitFn` query param is the name
    // of a function on a page, which returns
    // true as soon as page is loaded
    const waitFnName = req.query.waitFn

    if (waitFnName) {
      step = step.wait(function (fnName) {
        var fn = window[fnName]

        if (typeof fn !== 'function') {
          return false
        }

        return fn()
      }, waitFnName)
    }

    context.lastPath = path
    const buffer = await step.screenshot()

    // Releasing the browser back to the pool
    await browserPool.release(browserRef)

    // Send the image
    response.set('Content-Type', 'image/png')
    response.attachment('boo.png')
    response.send(buffer)
  } catch (error) {
    response
      .status(400)
      .json({ error: error.toString() })
  }
})

const port = process.env.PORT || 1337
app.listen(port, () => {
  log(`Server started on port ${port}`)
})
