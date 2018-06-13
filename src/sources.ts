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

import { Page, ElementHandle, JSHandle } from 'puppeteer';
import { CDTController } from './cdt-controller';
import * as utils from './utils';

// Sources Test
export class Sources extends CDTController {
  // Sources page
  public ndtPage: Page;
  // Offset for clicking some elements
  private clickOffset = 4;

  async init() {
    await super.init();
    this.ndtPage = await this.getNDTPage(this.browser);
    await this.switchTab(this.ndtPage, '#tab-sources');
  }

  async dispose() {
    if (this.ndtPage) await this.ndtPage.close();
  }

  async getTabbedScriptName() {
    // selector for source panel
    let selector = '#sources-panel-sources-view';
    let viewEle = await this.ndtPage.$(selector).then(handle => handle.asElement());
    let paneHandle = await viewEle.$('.tabbed-pane');
    // selector for tab title
    selector = '.tabbed-pane-header-tab.selected';
    let titleHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, paneHandle, selector);
    return this.ndtPage.evaluate(handle => {
      return handle.querySelector('.tabbed-pane-header-tab-title').innerHTML;
    }, titleHandle);
  }

  async getSourceCode(): Promise<ElementHandle> {
    // selector for source panel
    let selector = '#sources-panel-sources-view';
    let viewElement = await this.ndtPage.$(selector);
    let paneHandle = await viewElement.$('.tabbed-pane');
    return paneHandle.$('.CodeMirror-code');
  }

  async getScriptLineHandle(line: number): Promise<JSHandle> {
    // selector for script line
    let selector = 'div.CodeMirror-linenumber';
    let sourceHandle = await this.getSourceCode();
    let lines = await sourceHandle.$$(selector);
    let lineHandle = null;
    for (let i in lines) {
      let html = await this.ndtPage.evaluate(handle => handle.innerHTML, lines[i]);
      if (Number(html) === line) {
        lineHandle = lines[i];
      }
    }
    // return line's parent node
    return this.ndtPage.evaluateHandle(handle => handle.parentNode, lineHandle);
  }

  async foucsScriptLine(line: number) {
    let handle = await this.getScriptLineHandle(line);
    let codeLine = await this.ndtPage.evaluateHandle(handle => handle.nextSibling, handle);
    if (codeLine) {
      let ele = codeLine.asElement();
      await ele.click();
    }
  }

  async hasBreakpoint(line: number) {
    let handle = await this.getScriptLineHandle(line);
    let breakpoint = 'cm-breakpoint';
    return this.ndtPage.evaluate((handle, breakpoint) => {
      return handle.className.indexOf(breakpoint) >= 0 ? true : false;
    }, handle, breakpoint);
  }

  async hasDisabledBreakpoint(line: number) {
    let handle = await this.getScriptLineHandle(line);
    let breakpoint = 'cm-breakpoint-disabled';
    return this.ndtPage.evaluate((handle, breakpoint) => {
      return handle.className.indexOf(breakpoint) >= 0 ? true : false;
    }, handle, breakpoint);
  }

  async hasDeactivatedBreakpoint(line: number) {
    await this.foucsScriptLine(line);
    await this.ndtPage.waitFor(500);
    let handle = await this.getScriptLineHandle(line);
    let activeline = 'CodeMirror-activeline-gutter';
    return this.ndtPage.evaluate((handle, activeline) => {
      return handle.className.indexOf(activeline) >= 0 ? true : false;
    }, handle, activeline);
  }

  async isExectionLine(line: number) {
    let lineHandle = await this.getScriptLineHandle(line);
    let parentHandle = await this.ndtPage.evaluateHandle(handle => handle.parentNode, lineHandle);
    let exection = 'cm-execution-line';
    return this.ndtPage.evaluate((handle, exection) => {
      return handle.className.indexOf(exection) >= 0 ? true : false;
    }, parentHandle, exection);
  }

  async getDebugToolbar(name: string): Promise<JSHandle> {
    let panelHandle = await this.getPanelHandle(this.ndtPage, 'Sources');
    let sidebarHandle = await panelHandle.$$('.insertion-point-sidebar').then(handles => {
      return handles.length > 1 ? handles[handles.length - 1] : handles[0];
    });
    let itemHandles = await sidebarHandle.$$('.flex-none');
    let toolbarHandle: JSHandle;
    for (let n in itemHandles) {
      let titleHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, itemHandles[n], '.expandable-view-title');
      let title = await this.ndtPage.evaluate(handle => {
        if (handle !== undefined && handle !== null) return handle.innerText;
      }, titleHandle);
      if (title === name) toolbarHandle = itemHandles[n];
    }
    if (!toolbarHandle) throw new Error(name + ' is not found in toolbar');
    return toolbarHandle;
  }

  async getBreakpointsList(): Promise<ElementHandle[]> {
    let breakpointsHandle = await this.getDebugToolbar('Breakpoints');
    let childHandle = await this.ndtPage.evaluateHandle(handle => handle.children[0], breakpointsHandle);
    let listHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, childHandle, 'div.widget');
    let elem = listHandle.asElement();
    return elem.$$('div.breakpoint-entry');
  }

  async getBreakpointItem(line: number): Promise<JSHandle> {
    let breakpointsList = await this.getBreakpointsList();
    let bpHandle: JSHandle;
    for (let n in breakpointsList) {
      let handle = await this.ndtPage.evaluateHandle(handle => handle.children[0], breakpointsList[n]);
      let textHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, handle, '.dt-checkbox-text');
      let checkboxText = await this.ndtPage.evaluate(handle => handle.innerHTML, textHandle);
      if (checkboxText.indexOf(':' + line) >= 0) bpHandle = handle;
    }
    if (!bpHandle) throw new Error('No breakpoint is found for line ' + line + ' in breakpoints list');
    return bpHandle;
  }

  async getCallStackList(): Promise<ElementHandle[]> {
    let callstackHandle = await this.getDebugToolbar('Call Stack');
    let childHandle = await this.ndtPage.evaluateHandle(handle => handle.children[0], callstackHandle);
    let listHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, childHandle, 'div.widget');
    let elem = listHandle.asElement();
    return elem.$$('div.call-frame-item');
  }

  async isExpendedNode(handle: JSHandle): Promise<boolean> {
    return this.ndtPage.evaluate(handle => {
      // Frist ol node after the li
      let ol = handle.nextSibling;
      return ol.className.indexOf('expanded') >= 0 ? true : false;
    }, handle);
  }

  async getScriptTitleInNavigator(handle: ElementHandle): Promise<string> {
    let selector = '.tree-element-title';
    let titleHandle = await handle.$(selector);
    return this.ndtPage.evaluate(handle => handle.innerHTML, titleHandle);
  }

  async findElementHandleByFileName(handle: ElementHandle, selector: string, name: string): Promise<ElementHandle> {
    return handle.$$(selector).then(async handles => {
      for (let n in handles) {
        let text = await this.getScriptTitleInNavigator(handles[n]);
        if (text === name) return handles[n];
      }
    });
  }

  async getScriptFileHandle(script: string) {
    let panelHandle = await this.getPanelHandle(this.ndtPage, 'Sources');
    let navigatorHandle = await panelHandle.$('.navigator-tabbed-pane > .view-container');
    let networkHandle = await this.ndtPage.evaluateHandle(elem => elem.children[0], navigatorHandle);
    let treeDivHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, networkHandle, 'div.widget');
    let treeHandle = await this.ndtPage.evaluateHandle(elem => elem.children[0], treeDivHandle);
    // Node.js worker
    let workerHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, treeHandle, '.tree-outline');
    let workerElement = workerHandle.asElement();

    // Worker tree: Node.js > file:// or no domain tree
    let selectors = ['.navigator-worker-tree-item', '.navigator-domain-tree-item'];
    let handle: ElementHandle;
    for (let i in selectors) {
      handle = await workerElement.$(selectors[i]);
      if (handle) {
        // ol.expend
        let expanded = await this.isExpendedNode(handle);
        // Expend selected element
        if (!expanded) await this.clickElement(this.ndtPage, handle);
      }
    }
    // Folder tree
    let selector = '.navigator-nw-folder-tree-item';
    let folderName = utils.getScriptFolder(script);
    // Find folder matching with script
    let folderHandle = await this.findElementHandleByFileName(workerElement, selector, folderName);
    if (folderHandle) {
      // ol.expend
      let expanded = await this.isExpendedNode(folderHandle);
      // Expend
      if (!expanded) await this.clickElement(this.ndtPage, folderHandle);
    }
    // Script tree
    selector = '.navigator-script-tree-item';
    let testName = script;
    let siblingHandle: ElementHandle;
    if (folderHandle) {
      testName = utils.getScriptName(script);
      siblingHandle = folderHandle;
    } else if (handle) {
      siblingHandle = handle;
    }
    // li > ol.expaned
    let nextHandle = await this.ndtPage.evaluateHandle(handle => handle.nextSibling, siblingHandle);
    let nextElement = nextHandle.asElement();
    let scriptHandle = await this.findElementHandleByFileName(nextElement, selector, testName);
    if (!scriptHandle) throw new Error('No file is found for ' + testName);
    return scriptHandle;
  }

  // Test debugging source file loaded
  async openSourceScript(script: string) {
    let scriptHandle = await this.getScriptFileHandle(script);
    await this.clickElement(this.ndtPage, scriptHandle);
    return this.getScriptTitleInNavigator(scriptHandle);
  }

  // Test add breakpoint
  async addBreakpoint(line: number) {
    let result = await this.hasBreakpoint(line);
    if (result) throw new Error('The line ' + line + ' has added breakpoint');
    let lineHandle = await this.getScriptLineHandle(line);
    await this.clickElement(this.ndtPage, lineHandle, this.clickOffset);
    // reload the line class
    await this.ndtPage.waitFor(200);
    return this.hasBreakpoint(line);
  }

  // Test remove breakpoint
  async removeBreakpoint(line: number) {
    let result = await this.hasBreakpoint(line);
    if (!result) throw new Error('The line ' + line + ' has no breakpoint');
    let lineHandle = await this.getScriptLineHandle(line);
    await this.clickElement(this.ndtPage, lineHandle, this.clickOffset);
    await this.ndtPage.waitFor(200);
    // reload the line class
    let hasBp = await this.hasBreakpoint(line);
    return hasBp ? false : true;
  }

  // Test disable breakpoint
  async disableBreakpoint(line: number) {
    let bpHandle = await this.getBreakpointItem(line);
    let checkboxHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, bpHandle, 'input');
    let checked = await this.ndtPage.evaluate(handle => handle.checked, checkboxHandle);
    if (checked) {
      let checkboxElement = checkboxHandle.asElement();
      await checkboxElement.click();
    } else {
      throw new Error('The breakpoint has been disabled');
    }
    return this.hasDisabledBreakpoint(line);
  }

  // Reopen source
  async reopenSourceScript() {
    this.ndtPage = await this.getNDTPage(this.browser);
    await this.switchTab(this.ndtPage, '#tab-sources');
    await this.ndtPage.waitFor(500);
  }

  // Test debug functions
  async getDebugBtnHandle(btn: string): Promise<JSHandle> {
    let btnSeletors: { [key: string]: string; } = {
      'Resume'          : '.largeicon-resume',
      'Pause'           : '.largeicon-pause',
      'StepOver'        : '.largeicon-step-over',
      'StepInto'        : '.largeicon-step-into',
      'StepOut'         : '.largeicon-step-out',
      'Step'            : '.largeicon-step',
      'Deactivate'      : '.largeicon-deactivate-breakpoints',
      'Activate'        : '.largeicon-activate-breakpoints',
      'PauseOnException': '.largeicon-pause-on-exceptions',
    };
    let panelHandle = await this.getPanelHandle(this.ndtPage, 'Sources');
    let debugHandle = await panelHandle.$('.scripts-debug-toolbar');
    let childHandle = await this.evaluateHandleWithShadowRoot(this.ndtPage, debugHandle, btnSeletors[btn]);
    let child = await this.ndtPage.evaluate(handle => handle, childHandle);
    let handle: JSHandle;
    if (child) {
      handle = await this.ndtPage.evaluateHandle(handle => handle.parentNode, childHandle);
    }
    return handle;
  }

  async getDebugBtnState(btn: string) {
    let on = false;
    let handle = await this.getDebugBtnHandle(btn);
    if (handle) {
      let classes = await this.ndtPage.evaluate(handle => handle.className, handle);
      if (classes.indexOf('toolbar-state-on') > -1) {
        on = true;
      }
    }
    return on;
  }

  async clickDebugBtn(btn: string) {
    let btnHandle = await this.getDebugBtnHandle(btn);
    if (btnHandle) {
      let btn = btnHandle.asElement();
      await btn.click();
      await this.ndtPage.waitFor(500);
    } else {
      throw new Error(btn + ' is not available');
    }
  }
}
