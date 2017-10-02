# MapHubs Screenshot Service

Forked from Forked from https://github.com/cheeaun/puppetron modified to add additional API options like custom cookies, headers, and custom wait options

Supports screenshots of pages with WebGL.

This is using Puppeteer
> [Puppeteer](https://github.com/GoogleChrome/puppeteer) (Headless Chrome Node API)-based rendering solution.


API
---


```
http://screenshots.mydomain.com/
```

POST or GET (as url params)

Parameters:

- `type` - REQUIRED 'png', 'jpeg', or 'pdf'
- `width` - page width
- `height` - page height
- `thumbWidth` - width of thumbnail, respecting aspect ratio (no default, has to be smaller than `width`)
- `fullPage` - takes a screenshot of the full scrollable page (default: `false`). If the page is too long, it may time out.
- `clipSelector` - CSS selector of element to be clipped (no default). E.g.: `.weather-forecast`.
- `cookies` - Array of cookie objects
- `agent` - custom user agent
- `headers` - Object with custom HTTP headers
- `selector` - Wait for this selector to be present on the page
- `selectorOptions` - object with options including `timeout`, see Puppeteer docs 


Also passes through most parameters from Puppeteer https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md

Warnings
---
We are using this as a private service behind a firewall, therefore some of the protections and tools from Puppetron have been removed. 

I recommend reviewing and restoring some of that before deploying this publically or using it to screenshot pages with lots of media/tracking services like news articles etc.

Limitations
---

WebGL screenshots on macOS don't work in headless mode, but will work using `HEADFUL=true` or from Docker

PDFs of WebGL do not seem to work

Development
---

### Requirements

- Node.js
- Docker

For local Chromium install:

1. `npm install`
2. `npm start`
3. Load `localhost:3000`

For Docker-based install:

1. `docker build . -t puppet`
2. `docker run -p 8080:3000 puppet`
3. Load `localhost:8080`

Credits
---

Forked from https://github.com/cheeaun/puppetron modified to add additional API options

Original Credits from Puppetron:

Block list from [Prerender](https://github.com/prerender/prerender/blob/master/lib/resources/blocked-resources.json).

Inspired by [`zenato/puppeteer`]((https://hub.docker.com/r/zenato/puppeteer/)), [`puppeteer-renderer`](https://github.com/zenato/puppeteer-renderer) and [Rendertron](https://render-tron.appspot.com/).
