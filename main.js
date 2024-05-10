import { crawlPage } from "./crawl.js"
import { printReport, sortPages } from "./report.js"

async function main() {
    if (process.argv.length < 3) {
        console.log('no website provided')
        return
    }
    if (process.argv.length > 3) {
        console.log('to many arguments provided')
        return
    }
    const baseURL = process.argv[2]
    console.log(`start crawl of: ${baseURL}...`)

    const pages = await crawlPage(baseURL)
    console.log(pages)

    printReport(pages)
}

main()
