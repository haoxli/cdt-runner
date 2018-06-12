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

describe('Step into and out', () => {
  const test = 'tests/test-buffer.js';

  beforeAll(async () => {
    await runner.init();
  });

  it('test step into definition', async () => {
    await runner.clickDebugBtn('StepInto');
    let result = await runner.isExectionLine(6);
    expect(result).toBe(true);
  });

  it('test step into moudle', async () => {
    await runner.clickDebugBtn('StepInto');
    let tab = await runner.getTabbedScriptName();
    expect(tab).toMatch('untitled');
    let list = await runner.getCallStackList();
    expect(list.length).toEqual(2);
  });

  it('test step out moudle', async () => {
    await runner.clickDebugBtn('StepOut');
    let tab = await runner.getTabbedScriptName();
    expect(test).toMatch(tab);
    let list = await runner.getCallStackList();
    expect(list.length).toEqual(1);
    let result = await runner.isExectionLine(11);
    expect(result).toBe(true);
  });

  it('test step out definition', async () => {
    await runner.clickDebugBtn('StepOut');
    let result = await runner.isExectionLine(12);
    expect(result).toBe(true);
  });

  it('test step into function', async () => {
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    let tab = await runner.getTabbedScriptName();
    expect(tab).toMatch('untitled');
    let result = await runner.isExectionLine(8);
    expect(result).toBe(true);
  });

  it('test step into condition statement', async () => {
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    let result = await runner.isExectionLine(12);
    expect(result).toBe(true);
  });

  it('test step out condition statement', async () => {
    await runner.clickDebugBtn('StepOut');
    let tab = await runner.getTabbedScriptName();
    expect(test).toMatch(tab);
    let result = await runner.isExectionLine(15);
    expect(result).toBe(true);
  });

  it('test step out function', async () => {
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepOut');
    let result = await runner.isExectionLine(18);
    expect(result).toBe(true);
  });

  it('test step out access function as step into', async () => {
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepOut');
    let tab = await runner.getTabbedScriptName();
    expect(tab).toMatch('untitled');
    await runner.clickDebugBtn('StepOut');
    let result = await runner.isExectionLine(25);
    expect(result).toBe(true);
  });

  it('test step into loop statement', async () => {
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    let result = await runner.isExectionLine(27);
    expect(result).toBe(true);
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepOut');
    let result2 = await runner.isExectionLine(27);
    expect(result2).toBe(true);
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepOut');
    let result3 = await runner.isExectionLine(27);
    expect(result3).toBe(true);
  });

  it('test step out loop statement', async () => {
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepOut');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepInto');
    await runner.clickDebugBtn('StepOut');
    let result2 = await runner.isExectionLine(33);
    expect(result2).toBe(true);
  });
});
