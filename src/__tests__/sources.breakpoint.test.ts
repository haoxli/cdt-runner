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

import { Sources } from '../sources';
import { getScriptName } from '../utils';

const runner = new Sources();
// Test name with FRMD-K64F
const test = 'js.tmp';

describe('Sources', () => {
  beforeAll(async () => {
    await runner.init();
  });

  it('test source file load', async () => {
    let scriptName = await runner.openSourceScript(test);
    expect(scriptName).toMatch(test);
    let testName = getScriptName(test);
    scriptName = await runner.getTabbedScriptName();
    expect(scriptName).toMatch(testName);
  });
});

describe('Breakpoint', () => {
  const blankLine = 51;
  const commentLine = 52;
  const codeLine = 60;

  afterAll(async () => {
    let result = await runner.hasBreakpoint(codeLine);
    if (result) await runner.removeBreakpoint(codeLine);
    let result2 = await runner.hasBreakpoint(codeLine + 1);
    if (result2) await runner.removeBreakpoint(codeLine + 1);
    let result3 = await runner.hasBreakpoint(codeLine + 2);
    if (result3) await runner.removeBreakpoint(codeLine + 2);
  });

  it('test add breakpoint in code', async () => {
    let result = await runner.addBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test add breakpoint in blank line', async () => {
    let result = await runner.addBreakpoint(blankLine);
    expect(result).toEqual(false);
  });

  it('test add breakpoint in comment line', async () => {
    let result = await runner.addBreakpoint(commentLine);
    expect(result).toEqual(false);
  });

  it('test add multiple breakpoints', async () => {
    let result = await runner.addBreakpoint(codeLine + 1);
    expect(result).toEqual(true);
    let result2 = await runner.addBreakpoint(codeLine + 2);
    expect(result2).toEqual(true);
  });

  it('test remove breakpoint', async () => {
    let result = await runner.removeBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test add breakpoint again after removed', async () => {
    let result = await runner.addBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test disable breakpoint', async () => {
    // await runner.addBreakpoint(testLine);
    let result = await runner.disableBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test remove disabled breakpoint', async () => {
    let disabled = await runner.hasDisabledBreakpoint(codeLine);
    expect(disabled).toEqual(true);
    let result = await runner.removeBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test deactivate breakpoints', async () => {
    await runner.addBreakpoint(codeLine);
    await runner.clickDebugBtn('Deactivate');
    let result = await runner.hasDeactivatedBreakpoint(codeLine);
    expect(result).toEqual(true);
    let result2 = await runner.hasDeactivatedBreakpoint(codeLine + 1);
    expect(result2).toEqual(true);
    let result3 = await runner.hasDeactivatedBreakpoint(codeLine + 2);
    expect(result3).toEqual(true);
  });

  it('test activate breakpoints', async () => {
    await runner.clickDebugBtn('Activate');
    let result = await runner.hasBreakpoint(codeLine);
    expect(result).toEqual(true);
    let result2 = await runner.hasBreakpoint(codeLine + 1);
    expect(result2).toEqual(true);
    let result3 = await runner.hasBreakpoint(codeLine + 2);
    expect(result3).toEqual(true);
  });

  it('test disabled breakpoints can be deactived', async () => {
    await runner.disableBreakpoint(codeLine);
    await runner.clickDebugBtn('Deactivate');
    let result = await runner.hasDeactivatedBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test disabled breakpoints can be activated', async () => {
    await runner.clickDebugBtn('Activate');
    let result = await runner.hasDisabledBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test deactivated breakpoints can be removed', async () => {
    await runner.clickDebugBtn('Deactivate');
    await runner.removeBreakpoint(codeLine);
    let result = await runner.hasBreakpoint(codeLine);
    expect(result).toEqual(false);
    await runner.removeBreakpoint(codeLine + 1);
    let result1 = await runner.hasBreakpoint(codeLine + 1);
    expect(result1).toEqual(false);
    await runner.removeBreakpoint(codeLine + 2);
    let result2 = await runner.hasBreakpoint(codeLine + 2);
    expect(result2).toEqual(false);
  });

  it('test deactivate off when no breakpoint', async () => {
    let result = await runner.getDebugBtnState('Activate');
    expect(result).toEqual(true);
    await runner.clickDebugBtn('Activate');
    let result2 = await runner.getDebugBtnState('Deactivate');
    expect(result2).toEqual(false);
  });

  it('test deactivate on when no breakpoint', async () => {
    let result = await runner.getDebugBtnState('Deactivate');
    expect(result).toEqual(false);
    await runner.clickDebugBtn('Deactivate');
    let result2 = await runner.getDebugBtnState('Activate');
    expect(result2).toEqual(true);
  });

  it('test add breakpoint when deactivate on', async () => {
    let result = await runner.addBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test deactivate off automatically when add new breakpoint', async () => {
    let result = await runner.getDebugBtnState('Deactivate');
    expect(result).toEqual(false);
  });
});

describe('Sources reopen', () => {
  let codeLine = 67;

  beforeAll(async () => {
    await runner.addBreakpoint(codeLine);
    await runner.addBreakpoint(codeLine + 1);
    await runner.addBreakpoint(codeLine + 2);
    await runner.removeBreakpoint(codeLine + 1);
    await runner.disableBreakpoint(codeLine + 2);
    await runner.clickDebugBtn('Deactivate');
    await runner.ndtPage.close();
    await runner.reopenSourceScript();
  });

  afterAll(async () => {
    let result = await runner.hasBreakpoint(codeLine);
    if (result) await runner.removeBreakpoint(codeLine);
    let result2 = await runner.hasBreakpoint(codeLine + 1);
    if (result2) await runner.removeBreakpoint(codeLine + 1);
    let result3 = await runner.hasBreakpoint(codeLine + 2);
    if (result3) await runner.removeBreakpoint(codeLine + 2);
  });

  it('test source script remains when reopen devtools', async () => {
    let scriptName = await runner.getTabbedScriptName();
    let testName = getScriptName(test);
    expect(scriptName).toMatch(testName);
  });

  it('test added breakpoint remains when reopen devtools', async () => {
    let result = await runner.hasBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test added breakpoint can be removed when reopen devtools', async () => {
    let result = await runner.removeBreakpoint(codeLine);
    expect(result).toEqual(true);
  });

  it('test deleted breakpoint not remain when reopen devtools', async () => {
    let result = await runner.hasBreakpoint(codeLine + 1);
    expect(result).toEqual(false);
  });

  it('test add breakpoint again when reopen devtools', async () => {
    let result = await runner.addBreakpoint(codeLine + 1);
    expect(result).toEqual(true);
  });

  it('test disabled breakpoint remains when reopen devtools', async () => {
    let result = await runner.hasDisabledBreakpoint(codeLine + 2);
    expect(result).toEqual(true);
  });

  it('test disabled breakpoint can be removed when reopen devtools', async () => {
    let result = await runner.removeBreakpoint(codeLine + 2);
    expect(result).toEqual(true);
  });

  it('test deactivate off when reopen devtools', async () => {
    let result = await runner.getDebugBtnState('Deactivate');
    expect(result).toEqual(false);
  });
});
