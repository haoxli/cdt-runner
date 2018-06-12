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

import { ElementHandle } from 'puppeteer';
import { CDTController } from './cdt-controller';

// CDT Connect Test
export class Connect extends CDTController {

  async init() {
    await super.init();
    await this.inspect(this.page);
  }

  async getRemoteTarget(remote: string): Promise<ElementHandle> {
    let selector = '.browser';
    await this.page.waitForSelector(selector);
    return this.page.$$(selector).then(async handles => {
      for (let handle of handles) {
        let id = await this.page.evaluate(handle => handle.id, handle);
        if (id === remote) return handle;
      }
    });
  }

  async findInspectScript(remote: string, script: string) {
    let targetHandle = await this.getRemoteTarget(remote);
    if (!targetHandle) throw new Error('Not found remote: ' + remote);
    return this.page.evaluate((handle, script) => {
      let subrows = handle.querySelectorAll('.subrow');
      let result = false;
      for (let subrow of subrows) {
        let name = subrow.querySelector('.name').innerHTML;
        if (name === script) result = true;
      }
      return result;
    }, targetHandle, script);

  }

  async getRemoteConfig(remote: string): Promise<ElementHandle> {
    let selector = '.target-discovery-line';
    await this.page.waitForSelector(selector);
    return this.page.$$(selector).then(async handles => {
      let configHandle: ElementHandle;
      for (let handle of handles) {
        let value = await this.page.evaluate(handle => handle.querySelector('input').value, handle);
        if (value === remote) configHandle = handle;
      }
      if (!configHandle) throw new Error('Not found remote: ' + remote);
      return configHandle;
    });
  }

  async saveRemoteConfig() {
    let doneBtn = await this.page.$('#button-done');
    await doneBtn.click();
  }

  async removeRemoteConfig(remote: string) {
    let confBtn = await this.page.$('#tcp-discovery-config-open');
    await confBtn.click();
    let remoteHandle = await this.getRemoteConfig(remote);
    let removeHandle = await this.page.evaluateHandle(handle => handle.querySelector('.close-button'), remoteHandle);
    let removeBtn = removeHandle.asElement();
    await removeBtn.click();
    await this.saveRemoteConfig();
    await this.page.waitFor(500);
  }
}
