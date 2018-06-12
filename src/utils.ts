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

const LIUNX_SEP: string = '/';

export function getScriptFolder(script: string): string {
  if (script.indexOf(LIUNX_SEP) === -1) return '';
  return script.substr(0, script.lastIndexOf(LIUNX_SEP));
}

export function getScriptName(script: string): string {
  let arr = script.split(LIUNX_SEP);
  return arr[arr.length - 1];
}
