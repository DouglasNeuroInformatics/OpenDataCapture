'use strict';

function greet(name) {
  return 'hello ' + name;
}

globalThis.greeting = greet('world');
