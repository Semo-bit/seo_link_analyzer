import { JSDOM } from 'jsdom'

function normailzeURL(url) {
    const urlObj = new URL(url)
    let fullPath = `${urlObj.host}${urlObj.pathname}`
    if (fullPath.slice(-1) === '/') {
        fullPath = fullPath.slice(0, -1)
    }
    return fullPath
}

function getURLsFromHTML(htmlBody, baseURL) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const anchors = dom.window.document.querySelectorAll('a')

    for (const anchor of anchors) {
        if (anchor.hasAttribute('href')) {
            let href = anchor.getAttribute('href')
            try {
                //convert relative url to absolute url
                href = new URL(href, baseURL).href
                urls.push(href)
            } catch(err) {
                console.log(`${err.message}: ${href}`)
            }
        }
    }
    return urls
}

async function fetchHTML(url) {
  let res
  try {
    res = await fetch(url)
  } catch (err) {
    throw new Error(`Got Network error: ${err.message}`)
  }

  if (res.status > 399) {
    throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`)
  }

  const contentType = res.headers.get('content-type')
  if (!contentType || !contentType.includes('text/html')) {
    throw new Error(`Got non-HTML response: ${contentType}`)
  }

  return res.text()
}

async function crawlPage(baseURL, currentURL = baseURL, pages = {}) {
    //if this is an offset URL, bail right away
    const currentURLObj = new URL(currentURL)
    const baseURLObj = new URL(baseURL)
    if (currentURLObj.hostname !== baseURLObj.hostname) {
        return pages
    }
    const normalizedURL = normailzeURL(currentURL)
    //if we already visted the page
    //just increase the count and dont repeat
    //the http request
    if (pages[normalizedURL] > 0) {
        pages[normalizedURL]++
        return pages
    }
    // initialize the page
    // since it doesnt exist yet
    pages[normalizedURL] = 1

    // fetch and parse the html of the current html
    console.log(`crawling ${currentURL}`)
    let html = ''
    try {
      html = await fetchHTML(currentURL)
    } catch (err) {
        console.log(err.message)
        return pages
    }
const nextURLs = getURLsFromHTML(html, baseURL)
for (const nextURL of nextURLs) {
    pages = await crawlPage(baseURL, nextURL, pages)
}
return pages
}

    
    

export { normailzeURL, getURLsFromHTML, crawlPage }

