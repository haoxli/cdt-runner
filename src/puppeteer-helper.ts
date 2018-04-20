// Copyright JS Foundation and other contributors, http://js.foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import os from 'os';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

export type Browser = puppeteer.Browser;
export type Page = puppeteer.Page;
export type Mouse = puppeteer.Mouse;

export class PuppeteerHelper {
  // global setup temp
  public PUPP_DIR: string = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
  public WS_ENDPOINT_PATH: string = path.join(this.PUPP_DIR, 'wsEndpoint');
  
  /* Get browser instance 
   * retrun: <Browser> Browser instance reated by jest_puppeteer_global_setup
   */
  async getBrowser() {
    let wsEndpoint = fs.readFileSync(this.WS_ENDPOINT_PATH, 'utf8');
    const browser: Browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
    return browser;
  }

  /* Return Page instance created by jest_puppeteer_global_setup,
   * or return a new page if no available.
   * browser: <Browser> Browser object
   * return: <Page> The last opened page object, create new page if no page avaliable
   */ 
  async getPage(browser: Browser) {
    let pages = await browser.pages();
    // FIXME: Sometimes get incorrect active page, seems that pages are not in order
    return pages.length > 0 ? pages[pages.length - 1] : await browser.newPage();
  }
}
