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

import { Browser, Page } from '../puppeteer-helper';
import { JDTRunner } from '../cdt';

describe('Jerry debugger', () => {
  let runner: JDTRunner;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    runner = new JDTRunner();
    await runner.init();
    browser = runner.browser;
    page = await runner.getDevtoolsPage(browser);
    await page.waitFor(2000);
  });

  afterAll(async () => {
    // Workaround for getPage() return incorrect page
    await page.close();
  });

  it('test console', async () => {
    await runner.cdtTabs(page, 'tab-console');
    await expect(page).toMatch('Console');
  });

  it('test sources', async () => {
    await runner.cdtTabs(page, 'tab-sources');
    await expect(page).toMatch('Sources');
  });
});
