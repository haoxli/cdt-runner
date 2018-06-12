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

describe('Step over', () => {
  const test = 'tests/test-buffer.js';

  beforeAll(async () => {
    jest.setTimeout(10000);
    await runner.init();
  });

  it('test step over moudle', async () => {
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    let tab = await runner.getTabbedScriptName();
    expect(test).toMatch(tab);
    let result = await runner.isExectionLine(11);
    expect(result).toEqual(true);
  });

  it('test step over definition', async () => {
    await runner.clickDebugBtn('StepOver');
    let result = await runner.isExectionLine(12);
    expect(result).toBe(true);
  });

  it('test step definition', async () => {
    await runner.clickDebugBtn('Step');
    let result = await runner.isExectionLine(13);
    expect(result).toBe(true);
  });

  it('test step over function', async () => {
    await runner.clickDebugBtn('StepOver');
    let tab = await runner.getTabbedScriptName();
    expect(test).toMatch(tab);
    let result = await runner.isExectionLine(15);
    expect(result).toBe(true);
  });

  it('test step function', async () => {
    await runner.clickDebugBtn('Step');
    let tab = await runner.getTabbedScriptName();
    expect(tab).toMatch('untitled');
    let result = await runner.isExectionLine(8);
    expect(result).toBe(true);
    await runner.clickDebugBtn('Step');
    let result2 = await runner.isExectionLine(10);
    expect(result2).toBe(true);
    await runner.clickDebugBtn('StepOut');
    let tab2 = await runner.getTabbedScriptName();
    expect(test).toMatch(tab2);
    let result3 = await runner.isExectionLine(18);
    expect(result3).toBe(true);
  });

  it('test step into loop statement', async () => {
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    let result = await runner.isExectionLine(27);
    expect(result).toBe(true);
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    let result2 = await runner.isExectionLine(27);
    expect(result2).toBe(true);
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    let result3 = await runner.isExectionLine(27);
    expect(result3).toBe(true);
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    let result4 = await runner.isExectionLine(27);
    expect(result4).toBe(true);
    await runner.clickDebugBtn('StepOver');
    await runner.clickDebugBtn('StepOver');
    let result5 = await runner.isExectionLine(33);
    expect(result5).toBe(true);
  });

  it('test step loop statement', async () => {
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('Step');
    let result = await runner.isExectionLine(39);
    expect(result).toBe(true);
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('StepOut');
    let result2 = await runner.isExectionLine(39);
    expect(result2).toBe(true);
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('StepOut');
    let result3 = await runner.isExectionLine(39);
    expect(result3).toBe(true);
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('StepOut');
    let result4 = await runner.isExectionLine(39);
    expect(result4).toBe(true);
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('StepOut');
    let result5 = await runner.isExectionLine(39);
    expect(result5).toBe(true);
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('Step');
    await runner.clickDebugBtn('StepOut');
    let result6 = await runner.isExectionLine(46);
    expect(result6).toBe(true);
  });
});
