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

import { PuppeteerHelper, Browser, Page } from './puppeteer-helper';

export class JDTRunner {
  public browser: Browser;
  public page: Page;
  public ndtPage: Page;
  private puppet: PuppeteerHelper;

  async init() {
    this.puppet = new PuppeteerHelper();
    this.browser = await this.puppet.getBrowser();
    this.page = await this.puppet.getPage(this.browser);
  }

  async inspect(page: Page) {
    await page.goto('chrome://inspect');
  }

  async getDevtoolsPage(browser: Browser): Promise<Page> {
    await this.inspect(this.page);
    await this.page.click('div [id="node-frontend"]');
    await this.page.waitFor(500);
    let targets = await browser.targets();
    for (let target of targets) {
      this.ndtPage = await target.page();
      if (!!this.ndtPage
          && this.ndtPage.url().indexOf('node_app.html') !== -1) break;
    }
    return this.ndtPage;
  }

  async cdtTabs(page: Page, ids: string) {
    const result = await page.evaluateHandle(arg => {
      let el = document.querySelector('.tabbed-pane').shadowRoot.getElementById(arg);
      return Promise.resolve(el);
    }, ids);
    const consoleElement = result.asElement();
    await consoleElement.click();
  }
}
