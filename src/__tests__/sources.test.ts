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
const testName = 'async_hooks.js';
const testLine = 3;

describe('Sources', () => {
    beforeAll(async () => {
      await runner.init();
    });
  
    afterAll(async () => {
      // Workaround for getPage() return incorrect page
      await runner.dispose();
    });
  
    it('test source file load', async () => {
      let scriptName = await runner.loadSourceScript();
      expect(scriptName).toMatch(testName);
      scriptName = await runner.getTabbedScriptName();
      expect(scriptName).toMatch(testName);
    });
});

describe('Breakpoint', () => {
  beforeAll(async () => {
    await runner.init();
  });

  afterAll(async () => {
    // Workaround for getPage() return incorrect page
    await runner.dispose();
  });

  it('test add breakpoint', async () => {
    let result = await runner.addBreakpoint(testLine);
    expect(result).toEqual(true);
  });

  it('test add multiple breakpoints', async () => {
    let result = await runner.addBreakpoint(testLine + 1);
    expect(result).toEqual(true);
    result = await runner.addBreakpoint(testLine + 2);
    expect(result).toEqual(true);
  });

  it('test remove breakpoint', async () => {
    let result = await runner.removeBreakpoint(testLine);
    expect(result).toEqual(false);
  });
});
  