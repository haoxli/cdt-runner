# JerryScript Debugger Tests
Auto tests for Zephyr.js JerryScript debugger

## Dependencies

- node.js
- `yarn` or `npm` (the steps below use `yarn`)

## Installing

```
$ cd jrs-debugger-tests
$ yarn install
```

## Pre-condition
Debugging JavaScript code on FRDM-K64F board
1. Setup ZJS build envrionment for FRMD-K64F following https://github.com/intel/zephyr.js#frdm-k64f-platform 
2. Enable the remote debugger mode for a particular JS application:
```
make BOARD=frdm_k64f DEBUGGER=on JS=tests/test-buffer.js
cp outdir/frdm_k64f/zephyr/zephyr.bin /media/<USERNAME>/MBED/
```
3. Connect FRMD-K64F network via enthernet
```
ip route add 192.168.1/24 dev eno1
ip addr add 192.168.1.2 dev eno1
```
4. Start debugger proxy
```
git clone https://github.com/jerryscript-project/jerryscript-debugger-ts
cd jerryscript-debugger-ts
yarn install
./jerry-debugger.sh --jerry-remote 192.168.1.1:5001
```

## Running tests

```
$ cd jrs-debugger-tests
$ yarn test
```

## Running tests in watch mode
```
$ cd jrs-debugger-tests
$ yarn test:watch
```

## Running the linter

```
$ cd jrs-debugger-tests
$ yarn lint
```

