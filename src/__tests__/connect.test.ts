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

import { Connect } from '../connect';

const runner = new Connect();
const remote = 'localhost:9229';
// const test = 'tests/test-buffer.js';
const inspectScript = 'untitled.js';

describe('Connect', () => {
  beforeAll(async () => {
    await runner.init();
  });

  it('connect to devtools with valid port', async () => {
    let result = await runner.findInspectScript(remote, inspectScript);
    expect(result).toEqual(true);
  });

  it('connect to devtools with invalid port', async () => {
    await runner.removeRemoteConfig(remote);
    let remoteTarget = await runner.getRemoteTarget(remote);
    expect(remoteTarget).toBe(undefined);
  });
});
