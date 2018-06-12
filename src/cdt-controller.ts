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

import { Browser, Page, JSHandle, ElementHandle } from 'puppeteer';
import { PuppeteerHelper } from './puppeteer-helper';

export interface Coordinate {
  x: number;
  y: number;
}

export class CDTController {
  public browser: Browser;
  public page: Page;
  private puppet: PuppeteerHelper;
  private panelSelectors: { [key: string]: string; } = {
    'Console' : 'console',
    'Sources' : 'sources',
    'Memory'  : 'heap_profiler',
    'Profiler': 'js_profiler',
  };

  async init() {
    this.puppet = new PuppeteerHelper();
    this.browser = await this.puppet.getBrowser();
    this.page = await this.puppet.getPage(this.browser);
  }

  async inspect(page: Page) {
    await page.goto('chrome://inspect');
    return page;
  }

  async getNDTPage(browser: Browser): Promise<Page> {
    let ndtPage: Page;
    await this.inspect(this.page);
    await this.page.click('div [id="node-frontend"]');
    await this.page.waitFor(500);
    let targets = await browser.targets();
    for (let target of targets) {
      let p = await target.page();
      if (p && p.url().indexOf('chrome-devtools-frontend') >= 0) {
        ndtPage = p;
        break;
      }
    }
    if (!ndtPage) throw new Error('Fail to get devtools page for Node.js');
    return ndtPage;
  }

  async switchTab(ndtPage: Page, selector: string) {
    let paneHandle = await ndtPage.$('.tabbed-pane');
    const result = await this.evaluateHandleWithShadowRoot(ndtPage, paneHandle, selector);
    if (result) {
      const consoleElement = result.asElement();
      await consoleElement.click();
    } else {
      throw new Error('No tab is found for ' + selector);
    }
  }

  /* Query element in ShadowRoot
   * page: <Page> Page object
   * handle: <JSHandle> A element JS handle contains the shadowRoot where the element to query
   * selector: <string> A selector of an element to query
   * return: Promise<JSHandle> A element JS handle matching selector, or null if no matched element
   */
  evaluateHandleWithShadowRoot(page: Page, handle: JSHandle, selector: string): Promise<JSHandle> {
    return page.evaluateHandle((handle, selector) => handle.shadowRoot.querySelector(selector), handle, selector);
  }

  /* Evaluate element coordinate in page doucment
   * page: <Page> Page object
   * handle: <JSHandle> The element JS handle
   * return: Promise<Coordinate> The coordinate of element with x, y
   */
  async evaluateElementCoordinate(page: Page, handle: JSHandle): Promise<Coordinate> {
    return page.evaluate(handle => {
      let coordinate: Coordinate = { x: 0, y: 0 };
      // element rectagle
      let rect: ClientRect = handle.getBoundingClientRect();
      // document scroll offset
      let scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
      let scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
      coordinate.x = rect.left + scrollLeft;
      coordinate.y = rect.top + scrollTop;
      return Promise.resolve(coordinate);
    }, handle);
  }

  /* Click element in page by mouse
   * page: <Page> Page object
   * handle: <JSHandle> The element JS handle
   */
  async clickElement(page: Page, handle: JSHandle, offset = 0) {
    let coordinate = await this.evaluateElementCoordinate(page, handle);
    await page.mouse.click(coordinate.x + offset, coordinate.y + offset);
  }

  async getPanelHandle(ndtPage: Page, panel: string): Promise<ElementHandle> {
    let selector = '.view-container > .' + this.panelSelectors[panel];
    await ndtPage.waitForSelector(selector);
    return ndtPage.$(selector).then(handle => {
      if (!handle) throw new Error('No element is selected for ' + panel);
      return handle;
    });
  }
}
