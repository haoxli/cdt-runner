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

const runner = new Sources();

describe('Resume', () => {
  let firstLine = 48;
  let breakpointLine = 60;
  let disabledBreakpointLine = 61;
  let removedBreakpointLine = 67;
  let deactivatedLine = 74;

  beforeAll(async () => {
    await runner.init();
    await runner.addBreakpoint(breakpointLine);
    // disabled breakpoint
    await runner.addBreakpoint(disabledBreakpointLine);
    await runner.addBreakpoint(disabledBreakpointLine + 1);
    await runner.disableBreakpoint(disabledBreakpointLine);
    // removed breakpoint
    await runner.addBreakpoint(removedBreakpointLine);
    await runner.addBreakpoint(removedBreakpointLine + 1);
    await runner.removeBreakpoint(removedBreakpointLine);
    // deactivated breakpoint
    await runner.addBreakpoint(deactivatedLine);
  });

  it('test resume start with first line', async () => {
    let list = await runner.getCallStackList();
    expect(list.length).toEqual(1);
    let result = await runner.isExectionLine(firstLine);
    expect(result).toBe(true);
  });

  it('test resume start with repoen devtools', async () => {
    await runner.ndtPage.close();
    await runner.reopenSourceScript();
    let result = await runner.isExectionLine(firstLine);
    expect(result).toBe(true);
  });

  it('test resume with breakpoint', async () => {
    await runner.clickDebugBtn('Resume');
    let result = await runner.isExectionLine(breakpointLine);
    expect(result).toBe(true);
  });

  it('test resume with disabled breakpoint', async () => {
    await runner.clickDebugBtn('Resume');
    let result = await runner.isExectionLine(disabledBreakpointLine);
    expect(result).toBe(false);
    let result2 = await runner.isExectionLine(disabledBreakpointLine + 1);
    expect(result2).toBe(true);
  });

  it('test resume with removed breakpoint', async () => {
    await runner.clickDebugBtn('Resume');
    let result = await runner.isExectionLine(removedBreakpointLine);
    expect(result).toBe(false);
    let result2 = await runner.isExectionLine(removedBreakpointLine + 1);
    expect(result2).toBe(true);
  });

  it('test resume with deactivated breakpoint', async () => {
    await runner.clickDebugBtn('Deactivate');
    await runner.clickDebugBtn('Resume');
    let result = await runner.getCallStackList();
    expect(result.length).toBe(0);
  });

  it('test resume stop after end of debugging', async () => {
    // stop resume if pre test failed
    let flag = true;
    while (flag) {
      await runner.clickDebugBtn('Resume');
      let resume = await runner.getDebugBtnState('Resume');
      if (!resume) flag = false;
    }

    let result2 = await runner.getDebugBtnState('Pause');
    expect(result2).toBe(false);
    let result3 = await runner.getDebugBtnState('StepOver');
    expect(result3).toBe(false);
    let result4 = await runner.getDebugBtnState('StepInto');
    expect(result4).toBe(false);
    let result5 = await runner.getDebugBtnState('StepOut');
    expect(result5).toBe(false);
    let result6 = await runner.getDebugBtnState('Step');
    expect(result6).toBe(false);
  });

  it('test resume does not recover when activate breakpoint', async () => {
    await runner.clickDebugBtn('Activate');
    let result = await runner.getDebugBtnState('Resume');
    expect(result).toBe(false);
  });

  it('test resume does not recover when reopen devtools', async () => {
    await runner.ndtPage.close();
    await runner.reopenSourceScript();
    let result = await runner.getDebugBtnState('Resume');
    expect(result).toBe(false);
  });
});
