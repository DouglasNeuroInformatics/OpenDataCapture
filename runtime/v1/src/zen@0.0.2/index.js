// @ts-nocheck

/*
  zen.js - a library for browser-based behavioral experiments
  version: 0.0.2
  http://www.zenjs.org/
*/

// this is implemented here, but only used once, where I just replaced it, so we will not type it since I don't want this used if possible
Number.prototype.isPositive = function () {
  return this.valueOf() > 0;
};
const isNatural = (arg) => arg.valueOf() % 1 == 0 && arg.valueOf() > 0;
// this is implemented here, but only used once, where I just replaced it, so we will not type it since I don't want this used if possible
Number.prototype.isNatural = function () {
  return isNatural(this);
};
// this is implemented here, but not used, so we will not type it since I don't want this used if possible
Number.prototype.isInteger = function () {
  return this.valueOf() % 1 == 0;
};
// legacy
Number.prototype.round = function (places) {
  if (typeof places === 'undefined') {
    places = 0;
  }
  if (!(typeof places === 'number') || !isNatural(places + 1)) {
    throw new TypeError();
  }
  let m = Math.pow(10, places);
  return Math.round(this.valueOf() * m) / m;
};
/* Browser compatibility fixes */
// legacy
Array.prototype.invoke = function (fn) {
  let len = this.length >>> 0;
  if (typeof fn != 'function') {
    throw new TypeError();
  }
  let res = [];
  for (let i = 0; i < len; i++) {
    if (i in this) {
      res.push(fn.call(arguments[1], this[i]));
    }
  }
  return res;
};
/* Utility functions */
// this is implemented here, but not used, so we will not type it since I don't want this used if possible
Array.prototype.product = function () {
  let i = this.length,
    r = 1;
  while (i--) {
    let type = typeof this[i];
    if (type !== 'number') {
      throw new TypeError('Tried to multiply ' + type + ' : ' + this[i]);
    }
    r *= this[i];
  }
  return r;
};
// legacy
Array.prototype.sum = function () {
  let i = this.length;
  let s = 0;
  while (i--) {
    s += this[i];
  }
  return s;
};
// legacy
Array.prototype.average = function () {
  if (!this.length) return null;
  // legacy
  return this.sum() / this.length;
};
// legacy
Array.prototype.sd = function () {
  // legacy
  let avg = this.average();
  let subSum = this.reduce(function (run, cur) {
    let val = cur - avg;
    return run + val * val;
  }, 0);
  return Math.sqrt((1 / (this.length - 1)) * subSum);
};
// legacy
Array.prototype.unique = function () {
  let r = this.concat();
  let n = this.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (r[i] === r[j]) {
        r.splice(j--, 1);
        n--;
      }
    }
  }
  return r;
};
Array.prototype.includes = function (obj) {
  let i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
};
// TODO: generalize?
// legacy
Array.prototype.pluck = function (key) {
  let a = [];
  for (let i = 0, length = this.length; i < length; i++) {
    a.push(this[i][key]);
  }
  return a;
};
// legacy
Array.prototype.partition = function (fn) {
  if (!(typeof fn == 'function')) {
    throw new TypeError();
  }
  let haves = [];
  let haveNots = [];
  for (let i = 0, len = this.length; i < len; i++) {
    let val = this[i];
    if (fn(val)) {
      haves.push(val);
    } else {
      haveNots.push(val);
    }
  }
  return [haves, haveNots];
};
// legacy
Array.prototype.zip = function (a) {
  let r = [];
  if (a.length != this.length) {
    throw new Error('zip takes two equal length arrays');
  }
  for (let i = 0, len = this.length; i < len; i++) {
    r.push([this[i], a[i]]);
  }
  return r;
};
// From http://tech.karbassi.com/2009/12/17/pure-javascript-flatten-array/
// Modification - removed object from regex to allow hashes to live
// legacy
Array.prototype.flatten = function () {
  let flat = [];
  for (let i = 0, l = this.length; i < l; i++) {
    // legacy
    let type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
    if (type) {
      // legacy
      flat = flat.concat(/^(array|collection|arguments)$/.test(type) ? this.flatten.call(this[i]) : this[i]);
    }
  }
  return flat;
};
// Uses the Fisher-Yates algorithm.
// Source - http://snippets.dzone.com/posts/show/849
// this is implemented here, but not used, so we will not type it since I don't want this used if possible
Array.prototype.shuffle = function () {
  // eslint-disable-next-line no-var
  for (
    // eslint-disable-next-line no-var
    var j, x, i = this.length;
    i;
    j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x
  ) {
    /* empty */
  }
  return this;
};
// this is implemented here, but not used, so we will not type it since I don't want this used if possible
Array.prototype.random = function () {
  return this[coinFlip(this.length)];
};
export const getWindowHeight = function () {
  let y = 0;
  if (self.innerHeight) {
    y = self.innerHeight;
  } else if (document.documentElement?.clientHeight) {
    y = document.documentElement.clientHeight;
  } else if (document.body) {
    y = document.body.clientHeight;
  }
  return y;
};
export const getWindowWidth = function () {
  let x = 0;
  if (self.innerWidth) {
    x = self.innerWidth;
  } else if (document.documentElement?.clientWidth) {
    x = document.documentElement.clientWidth;
  } else if (document.body) {
    x = document.body.clientWidth;
  }
  return x;
};
// Flip an n-sided coin. Returns numbers in 0..n-1
// By default, n=2
export function coinFlip(n) {
  n = n || 2;
  return Math.floor(Math.random() * n);
}
// range from m to n
export function range(m, n) {
  const a = [];
  for (let i = m; i <= n; i++) {
    a.push(i);
  }
  return a;
}
// Returns set of vertices that define a polygon with n sides and vertex radius r.
export function polygon(n, r, offsetX, offsetY) {
  if (typeof n != 'number' || !n || n < 3) throw new TypeError('polygon() requires a number greater than 2');
  if (typeof r != 'number' || !r) r = 100;
  if (typeof offsetX != 'number' || !offsetX) offsetX = 0;
  if (typeof offsetY != 'number' || !offsetY) offsetY = 0;
  let pi = Math.PI,
    theta = (2 * pi) / n,
    angle = -pi / n;
  let sin = Math.sin,
    cos = Math.cos,
    points = [];
  while (n--) {
    points.push({
      x: Math.round(r * sin(angle)) + offsetX,
      y: Math.round(r * cos(angle)) + offsetY
    });
    angle += theta;
  }
  return points;
}
// return the cartesian product of an arbitrary number of arrays
export function cartesianProduct(a, b) {
  if (arguments.length < 2) {
    throw new TypeError('cartesianProduct takes two or more arguments');
  }
  let args = [];
  for (let arg of arguments) {
    args.push(arg.slice());
  }
  if (args.length > 2) {
    let partial = cartesianProduct(args[0], args[1]);
    args.splice(0, 2);
    args.unshift(partial);
    // legacy
    return cartesianProduct.apply(this, args);
  }
  let c = [];
  let a_len = a.length;
  let b_len = b.length;
  for (let i = 0; i < a_len; i++) {
    for (let j = 0; j < b_len; j++) {
      // check if the left factor is not an array
      if (Array.isArray(a[i])) {
        console.warn(`WARNING: Using legacy incorrect implementation, since typeof will never return array`);
      }
      const t = a[i].slice();
      // if (typeof a[i] !== 'array') {
      //   t = [a[i]];
      // } else {
      //   t = a[i].slice();
      // }
      c.push(t.concat(b[j]));
    }
  }
  return c;
}
export function vector(a, b, c, d) {
  return [a - c, b - d];
}
export function crossProduct(u, v) {
  let a = u.slice(0);
  let b = v.slice(0);
  while (a.length < 3) a.push(0);
  while (b.length < 3) b.push(0);
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
export function magnitude(u) {
  let sum = 0;
  let i = u.length;
  let t;
  while (i--) {
    t = u[i];
    sum = sum + t * t;
  }
  return Math.sqrt(sum);
}
export function dotProduct(u, v) {
  let sum = 0;
  let i = Math.min(u.length, v.length);
  while (i--) {
    sum += u[i] * v[i];
  }
  return sum;
}
/** positions is an array of {x,y} points */
export function maximumDeviation(positions) {
  let first = positions[0];
  let last = positions[positions.length - 1];
  let base = vector(first.x, first.y, last.x, last.y);
  let baseLength = magnitude(base);
  return positions.reduce(function (max, cur) {
    cur = vector(first.x, first.y, cur.x, cur.y);
    let dist = magnitude(crossProduct(base, cur)) / baseLength;
    return dist > max ? dist : max;
  }, 0);
}
export function areaUnderCurve(positions) {
  let first = positions[0];
  let last = positions[positions.length - 1];
  let base = vector(first.x, first.y, last.x, last.y);
  let baseLength = magnitude(base);
  let lastXOffset = 0;
  let auc = 0;
  for (let i = 0, len = positions.length; i < len; i++) {
    let cur = vector(first.x, first.y, positions[i].x, positions[i].y);
    let yOffset = magnitude(crossProduct(base, cur)) / baseLength;
    let xOffset = Math.abs(dotProduct(base, cur)) / baseLength;
    auc += yOffset * (xOffset - lastXOffset);
    lastXOffset = xOffset;
  }
  return auc;
}
export const zen = {
  elements: {},
  params: location.href.split('?')[1]
    ? location.href
        .split('?')[1]
        .split('&')
        .reduce(function (cumulative, current) {
          cumulative[current.split('=')[0]] = current.split('=')[1];
          return cumulative;
        }, {})
    : {},
  timeouts: []
};
export function $$$(id) {
  if (!zen.elements[id]) {
    zen.elements[id] = document.getElementById(id);
  }
  return zen.elements[id];
}
// Show slide with id and hide the rest
// Optimizations - it skips DOM elements that already have the
// right visibility value set
export function showSlide(id) {
  if (!zen.slides) {
    zen.slides = document.getElementsByClassName('slide');
  }
  let change_to;
  let slides = zen.slides;
  let i = zen.slides.length;
  while (i--) {
    change_to = slides[i].id == id ? 'block' : 'none';
    if (slides[i].style.display == change_to) continue;
    slides[i].style.display = change_to;
  }
}
// Convert degrees to centimeters
// Assumes a default viewing distance of 2 feet
export function degreesToCentimeters(degrees, viewingDistance) {
  viewingDistance = viewingDistance || 60.69; // 2 feet;
  return 2 * viewingDistance * Math.tan((degrees * Math.PI) / 360);
}
// Convert centimeters to degrees
// Assumes a default viewing distance of 2 feet
export function centimetersToDegrees(centimeters, viewingDistance) {
  viewingDistance = viewingDistance || 60.69;
  return (2 * Math.atan2(centimeters, 2 * viewingDistance) * 180) / Math.PI;
}
/* disableElasticScrolling()
 *
 * Disables the scrolling effect on touch devices
 * params: none
 * returns: none
 */
export function disableElasticScrolling() {
  document.ontouchmove = function (e) {
    e.preventDefault();
    e.stopPropagation();
  };
}
/* fixOrientation(orientation)
 *
 * Fix screen orientation, where orientation is either portrait or landscape.
 * Should only be used on touch devices. If the window.orientation value
 * is undefined on this device, does nothing.
 * Alerts user with alert() when the orientation is not correct.
 * params: orientation the orientation to enforce, either 'portrait' or 'landscape'
 * returns: none
 */
export function fixOrientation(orientation) {
  // if orientation is not defined, do nothing
  if (window.orientation == undefined) return;
  // if parameter is incorrect, throw type error
  if (orientation != 'portrait' && orientation != 'landscape') throw new TypeError();
  // calculate message and orientation values to accept
  let orientationValues = orientation == 'portrait' ? [0, 180] : [-90, 90];
  let explanation = orientation == 'portrait' ? 'upright' : 'sideways';
  let message = 'Please keep your device in ' + orientation + ' mode (' + explanation + ') for this test!';
  // do a check here first -- is the orientation correct?
  if (!orientationValues.includes(window.orientation)) {
    // eslint-disable-next-line no-alert
    alert(message);
  }
  // every time the orientation changes, fire this event and check the orientation.
  window.onorientationchange = function (e) {
    if (!orientationValues.includes(window.orientation)) {
      // eslint-disable-next-line no-alert
      alert(message);
    }
    e.preventDefault();
    e.stopPropagation();
  };
}
/* disableTouch (objs, selfID)
 * Disables all touch events on the objects passed in. Is either a list of HTML DOM
 * objects or the string "document," which removes the event listener on the
 * document.
 * params: objs a list of HTML DOM objects to disable touch on, or the string "document"
 * returns: none
 */
export function disableTouch(objs) {
  // disable touch on the document
  if (objs === 'document') {
    document.ontouchend = null;
  }
  // disable touch on the objs passed in
  else {
    // cycle through the objects
    for (let i = 0; i < objs.length; i++) {
      objs[i].ontouchstart = null;
      objs[i].ontouchend = null;
    }
  }
}
/* getTouchInput (objs, fun, state, duration)
 * Attaches an event listener to the HTML elements passed in through the objs
 * parameter. objs could either be "document," which listens for document taps,
 * or a list of HTML DOM objects, which listens to taps on those objects. When
 * ontouchend is fired, performs functionality specified.
 * Default behavior is that whatever object the user touched will be highlighted
 * with a solid blue border 5px wide so that the user could see which one was
 * registered. It would be best to set the css of objects you passed in to
 * border: 5px solid transparent, to avoid movement of the objects when the border
 * is applied.
 * params: objs a list of HTML DOM objects to have the event listeners attached to,
                or the string "document," which attaches the event listener to the
                whole document.
           fun the callback function that will be called when the ontouchend event
                is fired. Should take two parameters: first is the string containing
                the ID of the touched objected, and second is the state with which to
                call the function.
           state the 2nd parameter with which you would like to call the callback function
                fun. Specified so that you can provide more information to the callback
                function.
           duration (optional) the duration with which to attach the event listeners.
                after this duration, all are removed, and input is no longer
                registered.
 * returns: false
 */
export function getTouchInput(objs, fun, state, duration) {
  // if objs is not the expected format, throw error
  if (!(objs instanceof Array || objs === 'document')) throw new TypeError();
  // set duration timeout, if specified
  if (duration) setTimeout('disableTouch(objs)', duration);
  let startTime = new Date();
  let responseTime = 0;
  let objTouched = null;
  let clearTouchInput = function () {
    objTouched = null;
    for (let i = 0; i < objs.length; i++) {
      objs[i].style.border = '5px solid transparent';
    }
  };
  // the event listener for the ontouchend event
  let eventListener = function (e) {
    e = e || window.event;
    let resp;
    // get the response, if touched an element on the page, remove border added
    // from the ontouchstart event
    if (e === 'document') {
      resp = 'document';
    } else {
      resp = e.target.id;
      e.target.style.border = '5px solid transparent';
    }
    // prevent this event from bubbling up
    if (e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    let input = { response: resp, rt: responseTime };
    if (objs instanceof Array) clearTouchInput();
    // call the callback function
    fun(input, state);
    return false;
  };
  // attach the event listeners
  if (objs === 'document') {
    document.ontouchend = function () {
      eventListener('document');
    };
  } else {
    for (let i = 0; i < objs.length; i++) {
      objs[i].ontouchstart = function (e) {
        if (!objTouched) {
          // legacy
          responseTime = new Date() - startTime;
          objTouched = e.target;
          e.target.style.border = '5px solid #afd6fd';
        } else {
          clearTouchInput();
          // eslint-disable-next-line no-alert
          alert(
            'Please tap with only one finger, and lift your finger ' +
              'after tapping.' +
              '\n\nYour response has been discarded. Please try again.'
          );
          clearTouchInput();
        }
        return false;
      };
      objs[i].ontouchmove = function () {
        clearTouchInput();
      };
      objs[i].ontouchcancel = function () {
        clearTouchInput();
      };
      objs[i].ontouchend = function (e) {
        if (objTouched.id != e.target.id) return false;
        window.setTimeout(function () {
          eventListener(e);
        }, 350);
        disableTouch(objs);
        return undefined;
      };
    }
  }
  return false;
}
/* disableKeyboard()
 * disables keyboard interactions.
 * params: none
 * returns: none
 */
export function disableKeyboard() {
  document.onkeyup = null;
  document.onkeydown = null;
}
/* getKeyboardInput (acceptedKeys, fun, state, duration)
 * Attaches an event listener to the document to listen for onkeyup events.
 * When event is fired, performs functionality desired.
 * If specified, offers behavior to highlight an object
 * with a solid blue border 5px wide so that the user could see which one was
 * registered when a key is pressed. It would be best to set the css of objects
 * you passed in to border: 5px solid transparent, to avoid movement of the objects
 * when the border is applied.
 * params: 	acceptedKeys
                can be any of the following
                1) an array of keys that the user could press,
                2) the string, "any"
                3) an object with the following specification:
                   { highlight: true, key1: HTML_DOM_Object_to_highlight, key2: ... }
                When acceptedKeys is passed in the third form,
                highlighting of the objects is turned on, such that
                when the user presses key1 on his/her keyboard, the object passed in
                corresponding to that key will have a blue border formed around it.
            fun
                the callback function that will be called when the onkeyup event
                is fired. Should take two parameters: first is the key which was pressed,
                and second (optional) is the state with which to call the function.
            state the 2nd parameter with which you would like to call the callback
                function fun. Specified so that you can provide more information to the
                callback function.
            duration (optional) the duration with which to attach the event listeners.
                after this duration, all are removed, and input is no longer
                registered.
 * returns: false
 */
export function getKeyboardInput(acceptedKeys, fun, state, duration) {
  // is acceptedKeys passed in correctly?
  if (!(acceptedKeys.highlight == true || acceptedKeys instanceof Array || acceptedKeys === 'any'))
    throw new TypeError();
  // do we turn on highlighting?
  let highlight = acceptedKeys.highlight == true ? true : false;
  if (duration) setTimeout(disableKeyboard, duration);
  let startTime = new Date();
  let keyPressedDown = null;
  let responseTime = 0;
  let clearKeyboardInput = function () {
    keyPressedDown = null;
    if (highlight) {
      for (let key in acceptedKeys) {
        if (key != 'highlight') acceptedKeys[key].style.border = '5px solid transparent';
      }
    }
  };
  // onkeydown, we want to start highlighting if specified
  document.onkeydown = function (e) {
    // legacy
    responseTime = new Date() - startTime;
    e = e || window.event;
    let v = e.charCode || e.keyCode;
    let value = keyValue(v);
    if (
      acceptedKeys === 'any' ||
      (highlight && value in acceptedKeys) ||
      (acceptedKeys instanceof Array && acceptedKeys.includes(value))
    ) {
      if (!keyPressedDown || keyPressedDown == value) {
        keyPressedDown = value;
        if (highlight && acceptedKeys[value]) acceptedKeys[value].style.border = '5px solid #afd6fd';
      } else {
        clearKeyboardInput();
        // eslint-disable-next-line no-alert
        alert('Please press only one key!' + '\n\nYour response was not recorded. Please try again.');
        clearKeyboardInput();
      }
    }
    return false;
  };
  // monitor for onkeyup
  document.onkeyup = function (e) {
    e = e || window.event;
    let v = e.charCode || e.keyCode;
    let value = keyValue(v);
    // ignore keys pressed not in acceptedKeys
    // e.g. if user accidentally pressed another key
    if (
      acceptedKeys === 'any' ||
      (highlight && value in acceptedKeys) ||
      (acceptedKeys instanceof Array && acceptedKeys.includes(value))
    ) {
      // stop the event from bubbling
      if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        // IE doesn't follow W3C specifications...
        e.returnValue = false;
        e.cancelBubble = true;
      }
      let event_handler_helper = function () {
        // if the key pressed down is not the same as the key just lifted,
        // we've got a problem.
        if (value != keyPressedDown) return false;
        // if highlight is turned on, we want to "unhighlight"
        if (highlight) acceptedKeys[value].style.border = '5px solid transparent';
        let input = { response: value, rt: responseTime };
        clearKeyboardInput();
        if (state) fun(input, state);
        else fun(input);
        return false;
      };
      if (highlight) window.setTimeout(event_handler_helper, 300);
      else event_handler_helper();
    }
  };
  return false;
}
/* keyValue(code)
 *
 * Returns the value of the key with the specified keyboard code.
 *
 * params: code the keyboard code to look up
 * returns: varied the value of the key
 */
export function keyValue(code) {
  // There are duplicates here because different browsers
  // use slightly different codes for some special characters
  // See http://unixpapa.com/js/key.html
  let specialKeys = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    27: 'escape',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    46: 'delete',
    59: ';',
    61: '=',
    107: '=', // not ideal, since this is + on numpad keyboards
    109: '-',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'"
  };
  // legacy
  if (specialKeys[code]) return specialKeys[code];
  // numbers
  if (code > 47 && code < 58) return code - 48;
  // numpad
  if (code > 95 && code < 106) return code - 96;
  // characters - doing "abcdef..."[] doesn't work in IE
  if (code > 64 && code < 91) return 'abcdefghijklmnopqrstuvwxyz'.split('')[code - 65];
  return 0;
}
export function chain() {
  let args = arguments;
  // accept a single array as the argument
  if (arguments.length == 1 && Array.isArray(arguments[0])) {
    args = arguments[0];
  }
  // require an odd number of arguments
  if (args.length % 2 == 0) return;
  // execute the first argument immediately
  args[0]();
  let len = args.length;
  // uses arguments.length b/c different browsers are weird with "for var i in arguments"
  let r = [];
  for (let i = 2, execute_time = args[i - 1]; i < len; i += 2, execute_time += args[i - 1]) {
    r.push(setTimeout(args[i], execute_time));
  }
  return r;
}
export function clearChain(a) {
  for (let i = 0, len = a.length; i < len; i++) clearTimeout(a[i]);
}
/* preload (images, callback)
 *
 * Preloads images for the experiment so that there is no loading time.
 *
 * params: images an array of image filenames, in string format, to preload
 *	  callback the callback function to call when the preload has completed
 * returns: none
 */
export function preload(images, callback) {
  let self = preload;
  if (images.length == 0 && !self.finished) {
    self.finished = true;
    callback();
  }
  // 4th argument indicates whether this function was called recursively
  if (!arguments[3]) {
    images = images.slice(0);
    self.finished = false;
    self.numLoaded = 0;
    let status = document.createElement('div');
    status.className = 'slide';
    status.id = '_preload';
    status.style.textAlign = 'center';
    status.innerHTML =
      "<div style='padding-top: 25px;'>" +
      "<div style='display:none;' id='_preload_images'></div>" +
      "Loading resources: <span id='_preload_indicator'>0</span> / " +
      images.length +
      '';
    document.body.appendChild(status);
    showSlide('_preload');
  }
  // 3rd argument is the number of simultaneous downloads.
  // If unset, defaults to 6.
  let concurrent = arguments[2] || 6;
  let currentImages = images.splice(0, concurrent);
  concurrent = currentImages.length;
  for (let i = 0; i < currentImages.length; i++) {
    let image = new Image();
    image.onload = function () {
      $$$('_preload_indicator').innerHTML = ++self.numLoaded;
      $$$('_preload_images').appendChild(image);
      self(images, callback, 1, true);
    };
    image.src = currentImages[i];
  }
}
// Cookie functions. Taken from PPK
export function createCookie(name, value, days) {
  let expires = '';
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}
export function readCookie(name) {
  let nameEQ = name + '=';
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.startsWith(' ')) c = c.substring(1, c.length);
    if (c.startsWith(nameEQ)) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
export function eraseCookie(name) {
  createCookie(name, '', -1);
}
export function disableSelect() {
  document.onselectstart = function () {
    return false;
  };
}
export function disableRightClick() {
  document.oncontextmenu = function () {
    return false;
  };
}
export function disableDrag() {
  document.ondragstart = function () {
    return false;
  };
}
/*
Questionnaire Template

Example usage:
generateForm(survey, node, action, method, buttonText);

survey: an array of questions

node: the DOM element to insert the form

Action: location where form results are submitted. Action must be a string

Method: Either 'post' or 'get'. Defaults to post

Name: a unique name describing the nature of the question

question(required): the question

type(required): supports most html input types
    text: short text input
    textarea: larger text area
        requires rows and cols
    checkbox: multiple item selection
        requires options[] and values[]
    radio: single item selection
        requires options[] and values[]
    dropdown: single item selection in a dropdown menu
        requires options[] values[]
        
**subtype(optional): specifies a secondary class which will be assigned (prepended by zen_) to all divs and spans

**options(required): the set of answers visible to the user

**values(optional): set of number values for computing stats. If you'd like to apply number values to certain answers, use this array to assign values to each answer.
    options[] and values[] must be the same length
    
**applies to radio, dropdown, and checkbox only

Example survey array;
var survey= [
{
    name: "age",
    question: "How old are you?",
    type: "text",
    length: "25"
},
{
    name: "floss",
    question: "How often do you floss?",
    type: "radio",
    options: ['4 ft','5ft','6ft'],
    values: [4, 5, 6]
},
{
    name: "happy",
    question: "How tall are you in centimeters?",
    type: "checkbox",
    options: ['30','40','50'],
    values: [1, 2, 3]
},
{
    name: "hobbies",
    question: "What are your hobbies?",
    type: "textarea",
    rows: "4",
    cols: "20",
    validate: function(val) { return val.length == 2 }
},
{
    name: "gender",
    question: "What is your gender?",
    type: "dropdown",
    options: ["male","female"],
    selected: "male",
    optional: true
},
{
    name: "tall",
    question: "I am tall.",
    type: "radio",
    subtype: "likert",
    options: ['Strongly Disagree', 'Somewhat Disagree', 'Neither', 'Somewhat Agree', 'Strongly ],
    values: [-2, -1, 0, 1, 2]
},
{
    name:"info",
    text:"make sure to point out that you're tall, above"
},
{
    name: "weight",
    question: "",
    type:"hidden"
}
];
*/
export function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
//survey and action are required, method is optional
export function generateForm(survey, node, action, method, buttonText) {
  let self = generateForm;
  function tag(kind, options) {
    let str = '<' + kind + ' ';
    let optStr = [];
    for (let i in options) {
      if (Object.prototype.hasOwnProperty.call(options, i) && i != 'content')
        optStr.push(i + '=' + '"' + options[i] + '"');
    }
    str += optStr.join(' ') + '>';
    if (typeof options.content != 'undefined') {
      str += options.content;
    }
    str += '</' + kind + '>';
    return str;
  }
  if (typeof self.numForms === 'undefined') {
    self.numForms = 1;
  } else {
    self.numForms++;
  }
  let formId = '__form' + (self.numForms - 1);
  // eslint-disable-next-line no-self-assign
  method == undefined ? (method = 'POST') : (method = method);
  // eslint-disable-next-line no-alert
  onsubmit = () => alert('blart');
  // this.validate was breaking in firefox so I moved things down to an onclick with the submit button.  probably not
  // the right way to do it, but it was a somewhat urgent issue.  we should fix this.
  //var str = "<form id='"+formId+"' action='"+action+"' method='"+method+"' onsubmit='return this.validate();'><ol>";
  let str = "<form id='" + formId + "' action='" + action + "' method='" + method + "'><ol>";
  for (let a = 0, b; (b = survey[a]); a++) {
    if (b.type == 'textdiv') {
      b.optional = true;
      str += tag('div', { class: 'zen_infoblock', content: b.content, id: b.name, size: b.length });
      continue;
    }
    if (b.question != '') {
      str += b.type != ('hidden' || 'text') ? '<li>' : '';
      str +=
        "<p><div class='zen_question zen_" +
        b.type +
        "' id='zen_" +
        b.name +
        "_question'>" +
        b.question +
        "</div><div class='zen_input zen_" +
        b.type +
        (typeof b.subtype !== 'undefined' ? ' zen_' + b.subtype : '') +
        "' id='zen_" +
        b.name +
        "_input'>";
    }
    switch (b.type) {
      case '':
        str += tag('input', { id: b.name, type: 'text' });
        break;
      case 'text':
        str += tag('input', { id: b.name, maxlength: b.length, size: b.length, type: 'text' });
        break;
      case 'hidden':
        b.optional = true;
        b.question = b.name;
        str += tag('input', { id: b.name, type: 'hidden' });
        break;
      case 'checkbox':
      case 'radio':
        b.options.map(function (o, i) {
          let id = b.name + '[' + i + ']';
          str += tag('span', {
            class: typeof b.subtype !== 'undefined' ? 'zen_' + b.subtype : 'zen_' + b.type,
            content:
              tag('input', {
                class: 'zen_' + b.type,
                id: id,
                name: b.name,
                type: b.type,
                value: typeof b.values !== 'undefined' ? b.values[i] : b.options[i]
              }) + tag('label', { content: o, for: id })
          });
        });
        break;
      case 'dropdown':
        str += "<select id='" + b.name + "' name= '" + b.name + "'>";
        b.options.map(function (o, i) {
          let id = b.name + '[' + i + ']';
          str += tag('option', {
            class: 'zen_' + b.type,
            content: o,
            id: id,
            type: b.type,
            value: typeof b.values !== 'undefined' ? b.values[i] : b.options[i]
          });
          str =
            str.substring(0, str.lastIndexOf('"') + 1) +
            (b.selected == b.options[i] ? " selected='selected' " : ' ') +
            str.substring(str.lastIndexOf('"') + 1);
        });
        str += '</select>';
        /*
                        var options = b.options.reduce(
                            function(cumulative, value) {
                                var attributes = {value: value, content: value};
                                if (value.selected) attributes.selected = "selected";
                                
                                return cumulative + tag('option', attributes);
                            }
                        , "");
                    
                        str += tag('select', {name: b.name, content: options, id: b.name});
                        */
        break;
      case 'textarea':
        str += tag('textarea', {
          class: typeof b.subtype !== 'undefined' ? ' zen_' + b.subtype : '',
          cols: b.cols,
          id: b.name,
          name: b.name,
          rows: b.rows
        });
        break;
    }
    str += '</div></p>';
    str += b.type != 'hidden' ? '</li>' : '';
  }
  // moved the validation-triggering code down here to address a firefox compatibility issue with the 'this.validate' reference.
  // this is pretty hacky and should be fixed the right way at some point.
  if (buttonText) {
    //str = str + "<br /><button type='submit' id='zen_submit'>"+buttonText+"</button>";
    str =
      str +
      "<br /><button type='button' id='zen_submit' onclick='document.forms." +
      formId +
      ".validate();'>" +
      buttonText +
      '</button>';
  } else {
    //str = str + "<br /><button type='submit' id='zen_submit'>Next</button>";
    str =
      str +
      "<br /><button type='button' id='zen_submit' onclick='document.forms." +
      formId +
      ".validate();'>Next</button>";
  }
  str += "<input type='hidden' name='data' id='data' /><input type='hidden' name='score' id='score'/></form>";
  node.innerHTML += str;
  $$$(formId).validate = function () {
    let results = [];
    let score = 0;
    let finalCheck = true;
    let form = $$$(formId);
    survey.map(function (item) {
      let id = item.name;
      //if (item.optional) return;
      let el, value;
      // Search through checkbox/radio options
      if (item.type == 'checkbox' || item.type == 'radio') {
        value = [];
        // eslint-disable-next-line no-var
        for (var i = 0, len = item.options.length; i < len; i++) {
          let option = $$$(item.name + '[' + i + ']');
          if (option.checked) {
            value.push(option.value);
            if (item.values) {
              score += option.value * 1;
            }
          }
        }
        if (item.type == 'radio') {
          value = value.shift();
          item.validate = function (o) {
            return o;
          };
        } else {
          item.validate = function (o) {
            return o.length;
          };
        }
        el = $$$(item.name + '[' + (i - 1) + ']');
      }
      // Search through dropdown options
      else if (item.type == 'dropdown') {
        for (let i = 0, len = item.options.length; i < len; i++) {
          let option = $$$(item.name + '[' + i + ']');
          if (option.selected) {
            if (item.values) {
              score += option.value * 1;
            }
          }
        }
        el = form[item.name];
        value = $$$(item.name).options[0].selected;
        value = !value;
        item.validate = function (o) {
          return o;
        };
      } else {
        value = [];
        // deeply hacky.  We really need to solve this forthwith.
        el = form[item.name] ? form[item.name] : $$$(item.name);
        value = el.value;
      }
      let ans;
      if (!item.optional /*&& !item.text*/) {
        let errorEl = $$$(id + '.err');
        if (!errorEl) {
          errorEl = document.createElement('span');
          errorEl.id = id + '.err';
          errorEl.className = 'zen_error';
          insertAfter($$$('zen_' + id + '_input'), errorEl);
        }
        let notBlank = function (val) {
          return !(val === '');
        };
        let validate = item.validate || notBlank;
        if (!validate(value)) {
          finalCheck = false;
          errorEl.innerHTML = 'required';
        } else {
          errorEl.innerHTML = '';
          ans = new Object();
          eval('ans.zen_' + item.name + '= answer');
          results.push(ans);
          //results.push({ eval(item.name) : answer});
        }
      } else {
        ans = new Object();
        eval('ans.zen_' + item.name + '= answer');
        results.push(ans);
        //results.push({ eval(item.name) : answer});
      }
    });
    let errorTot = $$$(formId + '.err');
    if (!errorTot) {
      errorTot = document.createElement('span');
      errorTot.id = formId + '.err';
      errorTot.className = 'zen_err_flag';
      insertAfter($$$('zen_submit'), errorTot);
    }
    $$$('data').value = JSON.stringify(results);
    $$$('score').value = isNaN(score) ? 0 : score;
    if (finalCheck) {
      $$$(formId).submit();
    } else {
      errorTot.innerHTML =
        'There is a problem with your form submission.  Please check that you have filled out all required fields correctly.';
      return finalCheck;
    }
  };
}
