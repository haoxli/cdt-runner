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

import { Page, ElementHandle, JSHandle } from "puppeteer";
import { CDTController } from "./cdt-controller";

// Sources Test
export class Sources extends CDTController {
  // Sources page
  public page: Page;
  // Offset for clicking some elements
  private click_offset = 4;

  async init() {
    await super.init();
    this.page = await this.getNDTPage(this.browser);
    await this.switchTab('#tab-sources');
  }

  async dispose() {
    await this.page.close();
  }

  async getTabbedScriptName() {
    // selector for source panel
    let selector = '#sources-panel-sources-view';
    let viewEle = await this.page.$(selector).then(handle => handle.asElement());
    let paneHandle = await viewEle.$('.tabbed-pane');
    // selector for tab title   
    selector = '.tabbed-pane-header-tab-title';
    let titleHandle = await this.evaluateHandleWithShadowRoot(this.page, paneHandle, selector);
    return await this.page.evaluate(handle => handle.innerHTML, titleHandle);
  }

  async getSourceCode(): Promise<ElementHandle>  {
    // selector for source panel
    let selector = '#sources-panel-sources-view';
    let viewElement = await this.page.$(selector);
    let paneHandle = await viewElement.$('.tabbed-pane');
    return await paneHandle.$('.CodeMirror-code');
  }

  async getScriptLine(line: number): Promise<JSHandle>  {
    // selector for script line
    let selector = 'div.CodeMirror-linenumber';
    let sourceHandle = await this.getSourceCode();
    let lineHandle = await sourceHandle.$$(selector).then(lines => lines[line-1]);
    // return line's parent node
    return await this.page.evaluateHandle(handle => handle.parentNode, lineHandle);
  }

  async hasBreakpoint(handle: JSHandle) {
    let breakpoint = 'cm-breakpoint';
    return await this.page.evaluate((handle, breakpoint) => {
      return handle.className.indexOf(breakpoint) >= 0 ? true : false;
    }, handle, breakpoint)
  }

  // Test debugging source file loaded
  async loadSourceScript() {
    let selector = '.navigator-tabbed-pane > .view-container';
    await this.page.waitForSelector(selector);
    let networkHandle = await this.page.$(selector);
    let networkChildHandle = await this.page.evaluateHandle(elem => elem.children[0], networkHandle);
    let treeHandle = await this.evaluateHandleWithShadowRoot(this.page, networkChildHandle, 'div.widget');
    let treeChildHandle = await this.page.evaluateHandle(elem => elem.children[0], treeHandle);
    
    // Click Node.js
    let nodejsHandle = await this.evaluateHandleWithShadowRoot(this.page, treeChildHandle, '.tree-outline');
    let nodejsEle = await nodejsHandle.asElement();
    // Selectors for Node.js, file://, test folder, source file
    let selectors = ['.navigator-worker-tree-item', '.navigator-domain-tree-item',
                     '.navigator-nw-folder-tree-item', '.navigator-script-tree-item'];
    let handle: any;
    for (let i in selectors) {
      handle = await nodejsEle.$(selectors[i]);
      // Click selected element
      await this.clickElement(this.page, handle);
    }
    return await this.page.evaluate(elem => elem.innerHTML, handle);
  }

  // Test add breakpoint
  async addBreakpoint(line: number) {
    let lineHandle = await this.getScriptLine(line);
    let result = await this.hasBreakpoint(lineHandle);
    if (result)
      throw new Error('The line ' + line + ' has added breakpoint');
    await this.clickElement(this.page, lineHandle, this.click_offset);
    await this.page.waitFor(200);
    // reload the line class
    lineHandle = await this.getScriptLine(line);
    return await this.hasBreakpoint(lineHandle);
  }

  // Test remove breakpoint
  async removeBreakpoint(line: number) {
    let lineHandle = await this.getScriptLine(line);
    let result = await this.hasBreakpoint(lineHandle);
    if (!result)
      await this.addBreakpoint(line);
    lineHandle = await this.getScriptLine(line);
    await this.clickElement(this.page, lineHandle, this.click_offset);
    await this.page.waitFor(200);
    // reload the line class
    lineHandle = await this.getScriptLine(line);
    return await this.hasBreakpoint(lineHandle);
  }

  async disableBreakpoint() {

  }

}