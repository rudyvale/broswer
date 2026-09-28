require('events').EventEmitter.defaultMaxListeners = 0;
const puppeteer = require('puppeteer-extra')

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

function solving(message){
    return new Promise((resolve,reject) => {
        console.log(`[Browser] Lunching Browser`)
        puppeteer.use(StealthPlugin())
        puppeteer.use(RecaptchaPlugin({
            provider: {
                id:'2captcha',
                token:'484f6867edd89ad23af2d4cdfae8cbf5'
            },
            visualFeedback:true
        }))
        puppeteer.launch({
            headless: true,
            args: [
                `--proxy-server=http://${message.proxy}`,
                '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
                '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
                `--window-size=1920,1080`,
                "--window-position=000,000",
                "--disable-dev-shm-usage",
                "--no-sandbox",
              ]
        }).then(async (browser) => {
            console.log(`[Browser] Create Session | Proxy: ${message.proxy}`)
            const page = await browser.newPage()
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 OPR/84.0.4316.21');
            await page.setJavaScriptEnabled(true);
            await page.setDefaultNavigationTimeout(600000);
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false
                });
            })
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'platform', {
                    get: () => 'Win32'
                });
            })
            try {
                console.log(`[Browser] Session Resolving | Target: ${message.url} | Proxy: ${message.proxy}`)
                var admv = await page.goto(String(message.url).replace("%RAN%",""))
                console.log(`[Browser] Session Connected | Target: ${message.url} | Proxy: ${message.proxy}`)
            } catch (error) {


                reject(error)
                await browser.close()
            }
            try {
                const cloudFlareWrapper = await page.$('#cf-wrapper'); 

                if (cloudFlareWrapper) {
                    console.log(`[Browser] Session Found Hcaptcha/JS-Challenge | Target: ${message.url} | Proxy: ${message.proxy}`)
                    await page.waitForTimeout(15000, { waitUntil:'networkidle0' })
                    const maybecaptcha = await page.$('#cf-hcaptcha-container');
                    if (maybecaptcha) {
                        try {
                            await page.waitForSelector('#cf-hcaptcha-container'); 
                            console.log(`[Browser] Session Trying Solving Captcha | Target: ${message.url} | Proxy: ${message.proxy}`)
                            await page.solveRecaptchas();
                        } catch (e) {
                            console.log(`[Browser] Captcha Seem to be Solved | Target: ${message.url} | Proxy: ${message.proxy}`)
                        }
                    }
                    console.log(`[Browser] Captcha Seem to be Auto Solved | Target: ${message.url} | Proxy: ${message.proxy}`)
                }
                await page.waitForTimeout(30000, { waitUntil: 'networkidle0' })
                const cloudFlareWrapper2 = await page.$('#cf-wrapper'); 
                if (cloudFlareWrapper2) {
                    console.log(`[Browser] Session Found Hcaptcha/JS-Challenge | Target: ${message.url} | Proxy: ${message.proxy}`)
                    await page.waitForTimeout(15000, { waitUntil:'networkidle0' })
                    const maybecaptcha2 = await page.$('#cf-hcaptcha-container');
                    if (maybecaptcha2) {
                        try {
                            await page.waitForSelector('#cf-hcaptcha-container'); 
                            console.log(`[Browser] Session Trying Solving Captcha | Target: ${message.url} | Proxy: ${message.proxy}`)
                            await page.solveRecaptchas();
                        } catch (e) {
                            console.log(`[Browser] Captcha Seem to be Solved | Target: ${message.url} | Proxy: ${message.proxy}`)
                        }
                    }
                    console.log(`[Browser] Captcha Seem to be Auto Solved | Target: ${message.url} | Proxy: ${message.proxy}`)
                    await page.waitForTimeout(30000, { waitUntil: 'networkidle0' })
                    const cloudFlareWrapper3 = await page.$('#cf-wrapper'); 
                    if (cloudFlareWrapper3) {
                        console.log(`[Browser] Cant Bypass!| Target: ${message.url} | Proxy: ${message.proxy}`)
                        await browser.close();
                        reject();
                        return;
                    }
                }
                const cookies = await page.cookies()
                console.log(`[Browser] Session Found Cookies | Target: ${message.url} | Proxy: ${message.proxy}`)
                if (cookies) {
                    console.log(`[Browser] Session Found Cookies | Target: ${message.url} | Proxy: ${message.proxy}`)
                    console.log(`[Browser] Cookies: ${cookies.length} Object`)
                    resolve(cookies);
                    await browser.close();
                    return;

                }
            } catch (ee) { 
                reject(ee)
                await browser.close();
            }


        })
    })
}

module.exports = { solving:solving }
