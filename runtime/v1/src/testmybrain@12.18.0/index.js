// @ts-nocheck

import { saveTextAs } from '../file-saver@1.1.0';
import { RawDeflate } from '../js-deflate@0.3.0';
import { seedrandom } from '../seedrandom@2.4.4';

import '../setimmediate@1.0.4/index.js';

seedrandom('TestMyBrain', { global: true });

if (!Array.prototype.average) {
  Array.prototype.average = function () {
    if (!this.length) return null;
    return this.sum() / this.length;
  };
}

if (!Array.prototype.contains) {
  Array.prototype.contains = Array.prototype.includes; // alias compatible with zen.js
}

if (!Array.prototype.flatten) {
  Array.prototype.flatten = function flatten() {
    var flat = [];
    for (var i = 0, l = this.length; i < l; i++) {
      var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
      if (type) {
        flat = flat.concat(/^(array|collection|arguments)$/.test(type) ? flatten.call(this[i]) : this[i]);
      }
    }
    return flat;
  };
}

if (!Array.prototype.invoke) {
  Array.prototype.invoke = function (fun) {
    // enforce length as an unsigned 32-bit integer
    var len = this.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError('Argument is not a function');
    }
    var res = [];
    for (var i = 0; i < len; i++) {
      if (i in this) {
        res.push(fun.call(arguments[1], this[i]));
      }
    }
    return res;
  };
}

if (!Array.prototype.median) {
  Array.prototype.median = function () {
    if (!this.length) return null;

    var ar = this.slice();
    var mid = Math.floor(ar.length / 2);

    ar.sort(function (a, b) {
      return a - b;
    });

    if (ar.length % 2 === 1) return ar[mid];
    else return (ar[mid - 1] + ar[mid]) / 2;
  };
}

if (!Array.prototype.partition) {
  Array.prototype.partition = function (f) {
    if (!(typeof f === 'function')) {
      throw new TypeError('Argument of Array.prototype.partition ' + 'must be a function.');
    }
    let matches = [];
    let rejects = [];
    let val;
    for (let i = 0, len = this.length; i < len; i++) {
      val = this[i];
      if (f(val)) {
        matches.push(val);
      } else {
        rejects.push(val);
      }
    }
    return [matches, rejects];
  };
}

if (!Array.prototype.pluck) {
  Array.prototype.pluck = function (key) {
    'use strict';
    if (!key || typeof key !== 'string') {
      throw new TypeError('Argument must be a string');
    }
    return this.map(function (member) {
      var value;
      if (member[key] !== undefined) {
        value = typeof member[key] === 'function' ? member[key]() : member[key];
      } else {
        value = undefined;
      }
      return value;
    });
  };
}

if (!Array.prototype.sd) {
  Array.prototype.sd = function () {
    if (!this.length) return null;
    var variance = this.variance();
    if (variance === null) {
      console.error('Variable is null! This is an unhandled case in testmybrain so we did not fix it!');
    }
    return Math.sqrt(variance);
  };
}

if (!Array.prototype.unique) {
  Array.prototype.unique = function () {
    'use strict';
    return this.reduce(function (out, elem) {
      if (out.indexOf(elem) === -1) out.push(elem);
      return out;
    }, []);
  };
}

if (!Array.prototype.sum) {
  Array.prototype.sum = function () {
    var i = this.length;
    var s = 0;
    while (i--) s += this[i];
    return s;
  };
}

if (!Array.prototype.variance) {
  Array.prototype.variance = function () {
    if (!this.length) return null;
    var i,
      avg,
      len,
      demean,
      sumSquare = 0,
      sumError = 0;

    avg = this.average();
    len = this.length;

    if (avg === null) {
      console.error('Average is null! This is an unhandled case in testmybrain so we did not fix it!');
    }

    for (i = 0; i < len; i++) {
      demean = this[i] - avg;
      sumSquare += demean * demean;
      sumError += demean;
    }
    sumError *= sumError / len;

    return (sumSquare - sumError) / (len - 1);
  };
}

if (!Array.prototype.zip) {
  Array.prototype.zip = function (a) {
    var r = [];
    if (a.length !== this.length) {
      throw new TypeError('Array.prototype.zip: arrays must be equal length');
    }
    for (var i = 0, len = this.length; i < len; i++) {
      r.push([this[i], a[i]]);
    }
    return r;
  };
}

if (!Number.prototype.round) {
  Number.prototype.round = function (places) {
    if (typeof places === 'undefined') {
      places = 0;
    }
    if (!(typeof places === 'number') || !((places + 1) % 1 === 0) || !(places + 1 > 0)) {
      throw new TypeError('Number.prototype.round requires 0 or ' + 'a natural number for precision argument');
    }
    var m = Math.pow(10, places);
    return Math.round(this * m) / m;
  };
}

const tmbObjs = {
  elements: {},
  frames: {},
  params: {},
  slides: {}
};

tmbObjs.params = location.href.split('?')[1]
  ? location.href
      .split('?')[1]
      .split('&')
      .reduce(function (cumulative, current) {
        cumulative[current.split('=')[0]] = current.split('=')[1];
        return cumulative;
      }, {})
  : {};

/** @deprecated - alias compatible with zen.js */
const zen = tmbObjs;

const hasTouch = Boolean('ontouchend' in window || navigator.maxTouchPoints || false);

const hasPointer = Boolean(window.PointerEvent || false);

function getID(id, cache) {
  return !cache
    ? document.getElementById(id)
    : (tmbObjs.elements[id] = tmbObjs.elements[id] || document.getElementById(id));
}

/** @deprecated alias compatible with zen.js */
const $$$ = getID;

function showFrame() {
  var showF, i;
  var args = [];

  if (arguments.length === 1 && arguments[0] instanceof Array) {
    args = arguments[0];
  } else {
    for (i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
  }

  if (!tmbObjs.frames.length) tmbObjs.frames = document.getElementsByTagName('div');
  i = tmbObjs.frames.length;

  while (i--) {
    showF = args.indexOf(tmbObjs.frames[i].id) > -1 ? 'block' : 'none';
    if (tmbObjs.frames[i].style.display === showF) continue;
    tmbObjs.frames[i].style.display = showF;
  }
}

function showFrameClass() {
  var showF, i;
  var args = [];

  if (arguments.length === 1 && arguments[0] instanceof Array) args = arguments[0];
  else for (i = 0; i < arguments.length; i++) args[i] = arguments[i];

  if (!tmbObjs.frames.length) tmbObjs.frames = document.getElementsByTagName('div');
  i = tmbObjs.frames.length;

  while (i--) {
    showF = args.indexOf(tmbObjs.frames[i].className) > -1 ? 'block' : 'none';
    if (tmbObjs.frames[i].style.display === showF) continue;
    tmbObjs.frames[i].style.display = showF;
  }
}

function showSlide(id) {
  if (!tmbObjs.slides.length) {
    tmbObjs.slides = document.getElementsByClassName('slide');
  }

  var change_to,
    slides = tmbObjs.slides;
  var i = tmbObjs.slides.length;

  while (i--) {
    change_to = slides[i].id === id ? 'block' : 'none';
    if (slides[i].style.display === change_to) continue;
    slides[i].style.display = change_to;
  }
}

function showAlert(alertMessage, alertButtonText, action, fontSize, timeout) {
  var alertBox, alertContent, alertButton;

  if (!(alertBox = getID('alertBox', 1))) {
    alertBox = document.createElement('div');
    alertBox.id = 'alertBox';
    alertBox.style.margin = 'auto';
    alertBox.style.padding = '5%';
    alertBox.style.height = '100vh';
    alertBox.style.width = '100vw';
    alertBox.style.verticalAlign = 'middle';
    alertBox.style.textAlign = 'center';
    document.body.appendChild(alertBox);
    getID('alertBox', 1);
  }

  if (fontSize) alertBox.style.fontSize = fontSize;

  if (!(alertContent = getID('alertContent'))) {
    alertContent = document.createElement('span');
    alertContent.id = 'alertContent';
    alertBox.appendChild(alertContent);
  }
  alertContent.innerHTML = alertMessage;

  if (!(alertButton = getID('alertButton'))) {
    alertButton = document.createElement('button');
    alertButton.id = 'alertButton';
    alertButton.className = 'button';
    alertButton.style.margin = '0 auto';
    alertButton.style.lineHeight = '1.5em';
    alertButton.style.textAlign = 'center';
    alertButton.style.fontSize = '1.2em';
    alertBox.appendChild(alertButton);
  }
  if (alertButtonText && !timeout) {
    alertButton.style.width = alertButtonText.length + 'ch';
    alertButton.innerHTML = alertButtonText;
    alertButton.onclick = action;
    alertButton.style.display = 'block';
    showCursor('document.body');
  } else alertButton.style.display = 'none';

  if (timeout) setTimeout(action, timeout);

  showFrame();
  alertBox.style.display = 'table-cell';
}

function injectScript(url, id, callback) {
  var script;
  var head = document.head || document.getElementsByTagName('head')[0];

  if (id && (script = document.getElementById(id)) !== null) script.parentNode.removeChild(script);

  script = document.createElement('script');
  script.type = 'text/javascript';
  if (id) script.id = id;

  if (callback) {
    if (script.addEventListener) script.addEventListener('load', callback, true);
    else if (script.readyState) script.onreadystatechange = callback;
  }

  script.src = url;
  head.appendChild(script);
}

function fixMobileOrientation(orientation) {
  if ('orientation' in window || 'orientation' in screen || 'mozOrientation' in screen || 'msOrientation' in screen) {
    if (orientation !== 'portrait' && orientation !== 'landscape')
      throw new TypeError("fixMobileOrientation: specify either 'portrait' or 'landscape'");

    var explanation = orientation === 'portrait' ? 'upright' : 'sideways';
    var message = 'Please keep your device in ' + orientation + ' mode (' + explanation + ') for this test!';

    // eslint-disable-next-line no-inner-declarations
    function checkOrientation() {
      var viewOrientation;
      if ('orientation' in window) {
        // old specs
        viewOrientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
      } // new specs
      else {
        if (screen.orientation) viewOrientation = screen.orientation.type;
        else viewOrientation = screen.mozOrientation || screen.msOrientation;
        viewOrientation = ~viewOrientation.indexOf('landscape') ? 'landscape' : 'portrait';
      }

      // eslint-disable-next-line no-alert
      if (viewOrientation !== orientation) alert(message);
    }

    if ('onorientationchange' in window) window.addEventListener('orientationchange', checkOrientation, true);
    else if ('orientation' in screen) screen.orientation.addEventListener('change', checkOrientation, true);
    else if ('onmsorientationchange' in screen) screen.addEventListener('MSOrientationChange', checkOrientation, true);
    else if ('onmozorientationchange' in screen)
      screen.addEventListener('mozorientationchange', checkOrientation, true);

    checkOrientation();
  }
}

/** @deprecated alias compatible with zen.js */
const fixOrientation = fixMobileOrientation;

function setMobileViewportScale(width, height) {
  if ('orientation' in window || 'orientation' in screen || 'mozOrientation' in screen || 'msOrientation' in screen) {
    var viewportMeta;

    if (!width || !height) throw new TypeError('setMobileViewportScale: dimensions not specified');

    viewportMeta = document.getElementsByTagName('meta').viewport;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.id = 'viewport';
      document.getElementsByTagName('head')[0].appendChild(viewportMeta);
    }

    // eslint-disable-next-line no-inner-declarations
    function setScale() {
      var viewWidth, viewHeight, viewOrientation;
      var widthScale, heightScale, viewScale;
      var pageWidth;
      var metaContent;

      viewportMeta.content = 'width=device-width, initial-scale=1';

      if ('orientation' in window) {
        // old specs
        viewOrientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
      } // new specs
      else {
        if (screen.orientation) viewOrientation = screen.orientation.type;
        else viewOrientation = screen.mozOrientation || screen.msOrientation;
        viewOrientation = ~viewOrientation.indexOf('landscape') ? 'landscape' : 'portrait';
      }

      if (viewOrientation === 'portrait') {
        viewWidth = Math.min(screen.width, screen.height);
        viewHeight = Math.max(screen.width, screen.height);
      } else if (viewOrientation === 'landscape') {
        viewWidth = Math.max(screen.width, screen.height);
        viewHeight = Math.min(screen.width, screen.height);
      }

      widthScale = viewWidth / width;
      heightScale = viewHeight / height;

      if (widthScale < heightScale) {
        viewScale = widthScale;
        pageWidth = width;
      } else {
        viewScale = heightScale;
        pageWidth = viewWidth / viewScale;
      }

      metaContent = 'width=' + Math.round(pageWidth);
      metaContent += ', initial-scale=' + viewScale;
      metaContent += ', maximum-scale=' + viewScale;

      viewportMeta.content = metaContent;
    }

    setScale();

    if ('onorientationchange' in window) window.addEventListener('orientationchange', setScale, true);
    else if ('orientation' in screen) screen.orientation.addEventListener('change', setScale, true);
    else if ('onmsorientationchange' in screen) screen.addEventListener('MSOrientationChange', setScale, true);
    else if ('onmozorientationchange' in screen) screen.addEventListener('mozorientationchange', setScale, true);
  }
}

function showCursor(divId) {
  if (divId === 'document.body') document.body.style.cursor = 'auto';
  else getID(divId).style.cursor = 'auto';
}

function hideCursor(divId) {
  if (divId === 'document.body') document.body.style.cursor = 'none';
  else getID(divId).style.cursor = 'none';
}

function tmbSubmitToServer(tmbData, tmbScore, tmbOutcomes, tmbAction) {
  var tmbForm, tmbFormData, tmbFormScore, tmbFormOutcomes;

  tmbAction = tmbAction ? tmbAction : '/run';

  if (
    document.createElement &&
    (tmbForm = document.createElement('FORM')) &&
    (tmbFormData = document.createElement('INPUT')) &&
    (tmbFormScore = document.createElement('INPUT')) &&
    (tmbFormOutcomes = document.createElement('INPUT'))
  ) {
    tmbForm.name = 'form';
    tmbForm.method = 'post';
    tmbForm.action = tmbAction;
    tmbForm.onsubmit = function () {
      return false;
    };

    tmbFormData.type = 'hidden';
    tmbFormData.name = 'data';
    tmbFormData.value = JSON.stringify(tmbData);
    tmbForm.appendChild(tmbFormData);

    tmbFormScore.type = 'hidden';
    tmbFormScore.name = 'score';
    tmbFormScore.value = tmbScore;
    tmbForm.appendChild(tmbFormScore);

    tmbFormOutcomes.type = 'hidden';
    tmbFormOutcomes.name = 'outcomes';
    tmbFormOutcomes.value = JSON.stringify(tmbOutcomes);
    tmbForm.appendChild(tmbFormOutcomes);

    document.body.appendChild(tmbForm);
    tmbForm.submit();
  }
}

function tmbSubmitToURL(URL, tmbData) {
  var tmbForm;

  if (tmbData === null || typeof tmbData !== 'object') {
    throw new TypeError("tmbSubmitToURL: 'tmbData' is not an object.");
  }

  if (document.createElement && (tmbForm = document.createElement('FORM'))) {
    tmbForm.name = 'form';
    tmbForm.method = 'post';
    tmbForm.action = URL;
    tmbForm.onsubmit = function () {
      return false;
    };

    for (var dataKey in tmbData) {
      if (Object.prototype.hasOwnProperty.call(tmbData, dataKey)) {
        var tmbFormData = document.createElement('INPUT');

        tmbFormData.type = 'hidden';
        tmbFormData.name = dataKey;
        tmbFormData.value = tmbData[dataKey];

        tmbForm.appendChild(tmbFormData);
      }
    }

    document.body.appendChild(tmbForm);
    tmbForm.submit();
    document.body.removeChild(tmbForm);
  }
}

function tmbSubmitToFile(tmbData, tmbFile, autoSave) {
  var mykeys = [];
  var myvalues = '',
    mystring = '';
  var needToConfirm = true;

  for (var i = 0; i < tmbData.length; i++) {
    for (var propertyName in tmbData[i]) {
      if (Object.prototype.hasOwnProperty.call(tmbData[i], propertyName) && mykeys.indexOf(propertyName) === -1) {
        mykeys.push(propertyName);
        mystring += '"' + propertyName + '"' + ',';
      }
    }
  }
  mystring = mystring.substring(0, mystring.length - 1);
  mystring += '\r\n';

  for (i = 0; i < tmbData.length; i++) {
    myvalues = '';

    for (var j = 0; j < mykeys.length; j++) {
      if (!(typeof tmbData[i][mykeys[j]] === 'undefined' || tmbData[i][mykeys[j]] === null)) {
        if (tmbData[i][mykeys[j]] instanceof Object) {
          myvalues += '"' + JSON.stringify(tmbData[i][mykeys[j]]).replace(/"/g, '""') + '"';
        } else myvalues += '"' + tmbData[i][mykeys[j]] + '"';
      }

      myvalues += ',';
    }
    myvalues = myvalues.substring(0, myvalues.length - 1);
    mystring += myvalues + '\r\n';
  }

  if (autoSave) {
    needToConfirm = !saveTextAs(mystring, tmbFile); // in FileSaver.js

    try {
      // eslint-disable-next-line no-alert
      if (!needToConfirm) alert('Data have been saved in ' + tmbFile);
      // eslint-disable-next-line no-alert
      else alert('Could not save the data!!');
    } catch (err) {
      if (!needToConfirm) console.log('Data have been saved in ' + tmbFile);
      else console.log('Could not save the data!!');
    }
  }

  try {
    var popResults = window.open(
      '',
      '',
      'width=500,height=500,' + 'menubar=yes,toolbar=yes,scrollbars=yes,' + 'status=yes,resizable=yes'
    );

    if (popResults === null || typeof popResults === 'undefined') {
      throw new TypeError();
    }
  } catch (err) {
    // eslint-disable-next-line no-alert
    alert('Could not open data window. ' + 'Try disabling popup blockers before closing this.');

    popResults = window.open(
      '',
      '',
      'width=500,height=500,' + 'menubar=yes,toolbar=yes,scrollbars=yes,' + 'status=yes,resizable=yes'
    );
  } finally {
    if (popResults === null || typeof popResults === 'undefined') {
      // eslint-disable-next-line no-alert
      alert('Tried again and failed opening data window.');
    } else {
      popResults.document.write('<pre>' + mystring + '</pre><br>');

      var filename = popResults.document.createElement('INPUT');
      filename.type = 'text';
      filename.value = tmbFile;
      popResults.document.body.appendChild(filename);

      var button = popResults.document.createElement('BUTTON');
      var btext = popResults.document.createTextNode('Save');
      button.appendChild(btext);
      popResults.document.body.appendChild(button);

      popResults.onbeforeunload = function () {
        if (needToConfirm) {
          return 'Have you saved the data?';
        }
      };

      button.onclick = function () {
        tmbFile = filename.value;

        needToConfirm = !saveTextAs(mystring, tmbFile); // in FileSaver.js
        // eslint-disable-next-line no-alert
        if (needToConfirm) alert('Could not save the data!!');
      };

      popResults.document.title = tmbFile;

      popResults.document.close();
    }
  }
}

function logResults(res, mode) {
  if (!res || !res[0]) return;

  var log = '',
    propertyName,
    len = res.length;
  if (mode === 'cum' || (mode !== 'cum' && len === 1)) {
    for (propertyName in res[0]) {
      if (Object.prototype.hasOwnProperty.call(res[0], propertyName)) log += propertyName + ' ';
    }
    console.log(log);
    log = '';
  }
  for (var i = !mode || mode === 'inc' ? len - 1 : 0; i < len; i++) {
    for (propertyName in res[i]) {
      if (Object.prototype.hasOwnProperty.call(res[i], propertyName)) log += res[i][propertyName] + ' ';
    }
    log += '\n';
  }

  console.log(log);
}

function getUrlParameters(parameter, staticURL, decode) {
  var currLocation, parArr, parr, returnBool;

  currLocation = staticURL.length ? staticURL : window.location.search;

  if (!currLocation) return false;

  parArr = currLocation.split('?')[1].split('&');

  returnBool = true;

  for (var i = 0; i < parArr.length; i++) {
    parr = parArr[i].split('=');

    if (parr[0] === parameter) {
      returnBool = true;
      return decode ? decodeURIComponent(parr[1]) : parr[1];
    } else returnBool = false;
  }

  if (!returnBool) return false;
}

function urlEncode(str) {
  str = (str + '').toString();
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

function httpBuildQuery(formData, numericPrefix, argSeparator) {
  var value,
    key,
    tmp = [],
    that = this;

  var httpBuildQueryHelper = function (key, val, argSeparator) {
    var k,
      tmp = [];

    if (val === true) val = '1';
    else if (val === false) val = '0';

    if (val !== null) {
      if (typeof val === 'object') {
        for (k in val) {
          if (val[k] !== null && Object.prototype.hasOwnProperty.call(val, k))
            tmp.push(httpBuildQueryHelper(key + '[' + k + ']', val[k], argSeparator));
        }
        return tmp.join(argSeparator);
      } else if (typeof val !== 'function') return that.urlEncode(key) + '=' + that.urlEncode(val);
      else throw new Error('There was an error processing for http_build_query().');
    } else return '';
  };

  if (!argSeparator) argSeparator = '&';

  for (key in formData) {
    if (Object.prototype.hasOwnProperty.call(formData, key)) {
      value = formData[key];
      if (numericPrefix && !isNaN(key)) key = String(numericPrefix) + key;

      var query = httpBuildQueryHelper(key, value, argSeparator);
      if (query !== '') tmp.push(query);
    }
  }

  return tmp.join(argSeparator);
}

function ajaxRequest(params) {
  var request, message, query, responseHeader, response;

  var ajaxOptions = {
    async: true,
    callback: null,
    data: null,
    getHeaders: false,
    method: 'GET',
    pass: null,
    sendCredentials: false,
    timeout: 10000,
    url: '.',
    user: null
  };

  if (null !== params && 'object' === typeof params) {
    if (Object.prototype.hasOwnProperty.call(params, 'url')) ajaxOptions.url = params.url;
    if (Object.prototype.hasOwnProperty.call(params, 'method')) ajaxOptions.method = params.method.toUpperCase();
    if (Object.prototype.hasOwnProperty.call(params, 'data')) ajaxOptions.data = params.data;
    if (Object.prototype.hasOwnProperty.call(params, 'async')) ajaxOptions.async = params.async;
    if (Object.prototype.hasOwnProperty.call(params, 'timeout')) ajaxOptions.timeout = params.timeout;
    if (Object.prototype.hasOwnProperty.call(params, 'user')) ajaxOptions.user = params.user;
    if (Object.prototype.hasOwnProperty.call(params, 'pass')) ajaxOptions.pass = params.pass;
    if (Object.prototype.hasOwnProperty.call(params, 'getHeaders')) ajaxOptions.getHeaders = params.getHeaders;
    if (Object.prototype.hasOwnProperty.call(params, 'sendCredentials')) {
      ajaxOptions.sendCredentials = params.sendCredentials;
    }
    if (Object.prototype.hasOwnProperty.call(params, 'callback')) ajaxOptions.callback = params.callback;
  }

  if (ajaxOptions.data !== null) {
    query = httpBuildQuery(ajaxOptions.data);

    if (ajaxOptions.method === 'GET') ajaxOptions.url += '?' + query;
  }

  request = new XMLHttpRequest();

  try {
    request.open(ajaxOptions.method, ajaxOptions.url, ajaxOptions.async);

    if (ajaxOptions.async) {
      if (request.timeout !== undefined && request.ontimeout !== undefined) {
        request.timeout = ajaxOptions.timeout;

        request.ontimeout = function () {
          console.log('ajaxRequest timed out.');
        };
      }

      if (request.withCredentials !== undefined && ajaxOptions.sendCredentials) request.withCredentials = true;

      request.onreadystatechange = function () {
        if (ajaxOptions.getHeaders && request.readyState === 2) {
          responseHeader = request.getAllResponseHeaders();
          console.log('Request Status: ' + request.status + ' ' + request.statusText);
          if (responseHeader) console.log(responseHeader);
        }

        if (request.readyState === 4) {
          if (request.status >= 200 && request.status < 400) {
            response = request.response !== undefined ? request.response : request.responseText;

            if (ajaxOptions.callback !== null) ajaxOptions.callback(response);
            else return response;
          } else {
            message = 'Error in ajaxRequest: ' + request.status + ' ' + request.statusText;

            console.log(message);

            if (ajaxOptions.callback !== null) ajaxOptions.callback(null);
            else return null;
          }
        }
      };
    }

    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    if (ajaxOptions.user && ajaxOptions.pass) {
      request.setRequestHeader('Authorization', 'Basic ' + btoa(ajaxOptions.user + ':' + ajaxOptions.pass));
    }

    if (ajaxOptions.method === 'POST') {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
  } catch (error) {
    message = "Error in ajaxRequest 'open': " + error.message;
    console.log(message);

    if (ajaxOptions.callback !== null) ajaxOptions.callback(null);
    else return null;
  }

  try {
    if (ajaxOptions.method === 'POST') request.send(query);
    else request.send();
  } catch (error) {
    message = "Error in ajaxRequest 'send': " + error.message;
    console.log(message);
    if (ajaxOptions.callback !== null) ajaxOptions.callback(null);
    else return null;
  }

  if (!ajaxOptions.async) {
    if (ajaxOptions.getHeaders) {
      responseHeader = request.getAllResponseHeaders();
      console.log('Request Status: ' + request.status + ' ' + request.statusText);
      if (responseHeader) console.log(responseHeader);
    }

    if (request.status >= 200 && request.status < 400) {
      // fix for ie < 10: response is not defined
      response = request.response !== undefined ? request.response : request.responseText;
      if (ajaxOptions.callback !== null) ajaxOptions.callback(response);
      else return response;
    } else {
      message = 'Error in ajaxRequest: ' + request.status + ' ' + request.statusText;
      console.log(message);

      if (ajaxOptions.callback !== null) ajaxOptions.callback(null);
      else return null;
    }
  }
}

function imagePreLoad(imgs, args) {
  var resources = imgs.slice();

  var imgsLoaded = 0;

  var loadOptions = { callBack: null, copy: true, pipeline: true, progress: true };

  if (tmbObjs.images === undefined) tmbObjs.images = [];

  if (null !== args && 'object' === typeof args) {
    if (Object.prototype.hasOwnProperty.call(args, 'progress')) loadOptions.progress = args.progress;
    if (Object.prototype.hasOwnProperty.call(args, 'pipeline')) loadOptions.pipeline = args.pipeline;
    if (Object.prototype.hasOwnProperty.call(args, 'copy')) loadOptions.copy = args.copy;
    if (Object.prototype.hasOwnProperty.call(args, 'callBack')) loadOptions.callBack = args.callBack;
  }

  var requests = loadOptions.pipeline ? 1 : resources.length;

  var progDiv, progDivInfo, progDivCount, progDivBar;

  if (loadOptions.progress) {
    progDiv = document.createElement('div');
    progDivInfo = document.createElement('span');
    progDivCount = document.createElement('span');
    progDivBar = document.createElement('progress');

    progDiv.id = '_preloadDiv';
    progDiv.style.textAlign = 'center';
    progDiv.style.position = 'absolute';
    progDiv.style.left = '50%';
    progDiv.style.top = '50%';
    progDiv.style.marginTop = '-30px';
    progDiv.style.marginLeft = '-150px';

    progDivInfo.id = '_preloadText';
    progDivInfo.style.textAlign = 'center';
    progDivInfo.innerHTML = 'Loading resources: ';

    progDivCount.id = '_preloadCount';
    progDivCount.style.textAlign = 'center';
    progDivCount.innerHTML = '0 / ' + imgs.length + '<br>';

    progDiv.appendChild(progDivInfo);
    progDiv.appendChild(progDivCount);

    if (progDivBar && progDivBar.max !== undefined) {
      progDivBar.id = '_preloadBar';
      progDivBar.style.width = '300px';
      progDivBar.style.height = '30px';
      progDivBar.max = 1;
      progDivBar.value = 0;
      progDiv.appendChild(progDivBar);
    }

    document.body.appendChild(progDiv);
    progDiv.style.display = 'block';
  }

  var processImage = function (e) {
    var imgEl = e.target;

    imgsLoaded++;

    e.preventDefault();
    e.stopPropagation();

    imgEl.removeEventListener('load', processImage, true);
    imgEl.removeEventListener('error', processImage, true);

    if (e.type === 'error') {
      console.log('Error pre-loading image: ' + imgEl.src);
    }

    if (loadOptions.progress) {
      progDivCount.innerHTML = imgsLoaded + ' / ' + imgs.length + '<br>';
      if (progDivBar && progDivBar.max !== undefined) progDivBar.value = imgsLoaded / imgs.length;
    }

    if (loadOptions.copy) tmbObjs.images.push(imgEl);

    if (loadOptions.pipeline && imgsLoaded < imgs.length) {
      loadImage(resources.shift());
    }

    if (imgsLoaded === imgs.length) {
      if (loadOptions.progress) document.body.removeChild(progDiv);
      if (loadOptions.callBack) loadOptions.callBack();
    }
  };

  var loadImage = function (imgSrc) {
    var image = new Image();

    image.addEventListener('load', processImage, true);
    image.addEventListener('error', processImage, true);

    image.id = imgSrc;
    image.src = imgSrc;
  };

  while (requests > 0) {
    requests--;
    loadImage(resources.shift());
  }
}

function chooseInput(inputTypes, callback) {
  var msg = '',
    errMsg = '&nbsp',
    oldAction = '';

  if (inputTypes === null || typeof inputTypes !== 'object')
    throw new TypeError('chooseInput: missing or invalid inputTypes object.');

  function getinput(e) {
    var input;
    errMsg = '';

    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'keydown') {
      if (inputTypes.keyboard) input = 'keys';
      else errMsg = 'Keyboard';
    } else if (e.type === 'pointerdown' || e.type === 'MSPointerDown') {
      if (e.pointerType === 'touch' || e.pointerType === e.MSPOINTER_TYPE_TOUCH) {
        if (inputTypes.touch) input = 'taps';
        else errMsg = 'Touch';
      } else if (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE) {
        if (inputTypes.mouse) input = 'clicks';
        else errMsg = 'Mouse/Trackpad';
      } else if (e.pointerType === 'pen' || e.pointerType === e.MSPOINTER_TYPE_PEN) {
        if (inputTypes.touch) input = 'taps';
        else errMsg = 'Pen';
      }
    } else if (e.type === 'touchstart') {
      if (inputTypes.touch) input = 'taps';
      else errMsg = 'Touch';
    } else if (e.type === 'mousedown') {
      if (inputTypes.mouse) input = 'clicks';
      else errMsg = 'Mouse/Trackpad';
    }

    if (errMsg) errMsg += ' not valid for this test: try another input.';
    document.getElementById('errMsg').innerHTML = errMsg;

    if (input) {
      document.body.removeEventListener('keydown', getinput, true);
      if (hasTouch) document.body.removeEventListener('touchstart', getinput, true);
      document.body.removeEventListener('mousedown', getinput, true);
      if (hasPointer) {
        if (window.PointerEvent) document.body.removeEventListener('pointerdown', getinput, true);
        else if (window.MSPointerEvent) document.body.removeEventListener('MSPointerDown', getinput, true);
      }

      if ('touchAction' in document.body.style) document.body.style.touchAction = oldAction;
      else if ('msTouchAction' in document.body.style) document.body.style.msTouchAction = oldAction;

      document.getElementById('centeredTable').remove();

      if (callback) callback(input);
    }
  }

  msg += '<h3>Please choose how you will respond in this test:</h3>';
  if (inputTypes.keyboard) msg += '- To use a <b>keyboard</b>, <b>press any key</b> now.<br><br>';
  if (inputTypes.mouse) msg += '- To use a <b>mouse</b> or <b>track pad</b>, <b>click</b> now.<br><br>';
  if (inputTypes.touch) msg += '- To use a <b>touch screen</b>, <b>touch the screen</b> now.<br><br>';

  if ('touchAction' in document.body.style) {
    oldAction = document.body.style.touchAction;
    document.body.style.touchAction = 'none';
  } else if ('msTouchAction' in document.body.style) {
    oldAction = document.body.style.msTouchAction;
    document.body.style.msTouchAction = 'none';
  }

  document.body.addEventListener('keydown', getinput, true);
  document.body.addEventListener('mousedown', getinput, true);
  if (hasTouch) document.body.addEventListener('touchstart', getinput, true);
  if (hasPointer) {
    if (window.PointerEvent) document.body.addEventListener('pointerdown', getinput, true);
    else if (window.MSPointerEvent) document.body.addEventListener('MSPointerDown', getinput, true);
  }

  document.body.innerHTML +=
    "<div id='centeredTable' style='box-sizing: border-box; display: table; margin: auto; height: 100vh; width: 100vw; padding: 0 5% 0 5%; text-align: center; font-family: \"Helvetica Neue\",Helvetica,Arial,sans-serif;'>" +
    "<div style='display: table-cell; vertical-align: middle; text-align: center;'>" +
    "<div id='chooseInput' style='margin: auto; max-width: 450px; border: solid 2px #f1c40f; border-radius: 1em; background: #f7f7f7; padding: 10px; text-align:left; font-size: 13pt;'>" +
    msg +
    "<span id='errMsg' style='color: red;'>" +
    errMsg +
    '</span>' +
    '</div></div></div>';
}

const tmbUI = {
  UIelements: [],
  UIevents: [],
  UIkeys: [],
  downTimestamp: 0,
  dwell: 0,
  getInput: function () {},
  highlight: '',
  message: '',
  onreadyUI: function () {},
  response: '',
  rt: 0,
  status: '',
  timeout: 10000,
  timeoutRef: 0,
  upTimestamp: 0
};

tmbUI.getInput = function () {
  var i,
    timeStamp = now(),
    downDebounce = false,
    highlightEl,
    elBorder,
    elStroke,
    elStrokeWidth,
    errorMessage = '';

  for (var key in tmbUI) {
    if (Object.prototype.hasOwnProperty.call(tmbUI, key)) {
      switch (key) {
        case 'UIevents':
          if (tmbUI.UIevents.length === 0) errorMessage += 'Must specify UIevents: ' + "'keys', 'clicks' or 'taps'. ";
          if (!(tmbUI.UIevents instanceof Array)) tmbUI.UIevents = [tmbUI.UIevents];
          for (i = 0; i < tmbUI.UIevents.length; i++) {
            if (!['clicks', 'keys', 'taps'].includes(tmbUI.UIevents[i]))
              errorMessage += "'" + tmbUI.UIevents[i] + "' is not a valid event. ";
          }
          if (tmbUI.UIevents.includes('taps') && !hasTouch && !hasPointer)
            errorMessage += "'taps' is not a valid event. ";
          break;
        case 'UIkeys':
          if (!(tmbUI.UIkeys instanceof Array)) tmbUI.UIkeys = [tmbUI.UIkeys];
          for (i = 0; i < tmbUI.UIkeys.length; i++) {
            if (!keyboardCodes[tmbUI.UIkeys[i]])
              errorMessage += "'" + tmbUI.UIkeys[i] + "' is not a valid keyboard code. ";
          }
          break;
        case 'UIelements':
          if (!(tmbUI.UIelements instanceof Array)) tmbUI.UIelements = [tmbUI.UIelements];
          for (i = 0; i < tmbUI.UIelements.length; i++) {
            if (!getID(tmbUI.UIelements[i])) errorMessage += "'" + tmbUI.UIelements[i] + "' is not a valid element. ";
          }
          break;
        case 'timeout':
          if (tmbUI.timeout < 150) errorMessage += 'Timeout is ' + tmbUI.timeout + ' ms, ' + 'must be > 150 ms. ';
          break;
        case 'timeoutRef':
          if (tmbUI.timeoutRef !== 0) {
            tmbUI.message += "'getInput' called again while " + 'still busy. ';
            return false;
          }
          break;
        case 'highlight':
          if (tmbUI.highlight !== '') {
            var testDiv = document.createElement('div');
            testDiv.style.color = 'rgb(0, 0, 0)';
            testDiv.style.color = tmbUI.highlight;
            if (testDiv.style.color === 'rgb(0, 0, 0)') {
              testDiv.style.color = 'rgb(255, 255, 255)';
              testDiv.style.color = tmbUI.highlight;
              if (testDiv.style.color === 'rgb(255, 255, 255)')
                errorMessage += "'highlight' must be " + 'empty string or valid CSS color. ';
            }
          }
          break;
        case 'onreadyUI':
          break;
        case 'getInput':
          break;
        case 'status':
          tmbUI.status = '';
          break;
        case 'message':
          tmbUI.message = '';
          break;
        case 'response':
          tmbUI.response = '';
          break;
        case 'downTimestamp':
          tmbUI.downTimestamp = 0;
          break;
        case 'rt':
          tmbUI.rt = 0;
          break;
        case 'upTimestamp':
          tmbUI.upTimestamp = 0;
          break;
        case 'dwell':
          tmbUI.dwell = 0;
          break;
        default:
          errorMessage += "Invalid parameter '" + key + "'. ";
      }
    }
  }

  if (tmbUI.UIkeys.length > 0 && !tmbUI.UIevents.includes('keys'))
    errorMessage += "Need 'keys' in UIevents for valid keys. ";
  if (tmbUI.UIkeys.length && tmbUI.UIelements.length && tmbUI.UIelements.length < tmbUI.UIkeys.length)
    errorMessage += 'Invalid number of UIelements, ' + "more 'keys' than 'UIelements'. ";
  if (tmbUI.UIelements.length === 0 && tmbUI.highlight !== '') errorMessage += 'No elements to highlight. ';

  if (errorMessage) {
    tmbUI.status = 'error';
    tmbUI.message = errorMessage;

    var readyUI = new CustomEvent('readyUI');
    document.addEventListener('readyUI', tmbUI.onreadyUI, true);
    document.dispatchEvent(readyUI);
    document.removeEventListener('readyUI', tmbUI.onreadyUI, true);

    return false;
  }

  function downResponseHandler(e) {
    var responseEvent, r;

    responseEvent = e; //|| window.event;

    responseEvent.preventDefault();
    responseEvent.stopPropagation();

    if (downDebounce === false) {
      if (tmbUI.UIevents.includes('keys') && responseEvent.type === 'keydown') {
        r = responseEvent.charCode || responseEvent.keyCode;

        if (tmbUI.UIkeys.includes(r) || tmbUI.UIkeys.length === 0) {
          tmbUI.response = codeToKey(r);

          if (tmbUI.highlight !== '' && tmbUI.UIkeys.length > 0)
            highlightEl = getID(tmbUI.UIelements[tmbUI.UIkeys.indexOf(r)]);

          downDebounce = true;
        }
      }
      if (tmbUI.UIevents.includes('clicks')) {
        if (
          responseEvent.type === 'mousedown' ||
          (responseEvent.type === 'pointerdown' && responseEvent.pointerType === 'mouse') ||
          (responseEvent.type === 'MSPointerDown' && responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_MOUSE)
        ) {
          if (tmbUI.UIelements.length === 0) tmbUI.response = 'document';
          else tmbUI.response = responseEvent.target ? responseEvent.target.id : responseEvent.srcElement.id;

          if (tmbUI.highlight !== '') highlightEl = getID(tmbUI.response);

          downDebounce = true;
        }
      }
      if (tmbUI.UIevents.includes('taps')) {
        if (
          responseEvent.type === 'touchstart' ||
          (responseEvent.type === 'pointerdown' &&
            (responseEvent.pointerType === 'touch' || responseEvent.pointerType === 'pen')) ||
          (responseEvent.type === 'MSPointerDown' &&
            (responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_TOUCH ||
              responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_PEN))
        ) {
          if (tmbUI.UIelements.length === 0) tmbUI.response = 'document';
          else tmbUI.response = responseEvent.target ? responseEvent.target.id : responseEvent.srcElement.id;

          if (tmbUI.highlight !== '') highlightEl = getID(tmbUI.response);

          downDebounce = true;
        }
      }

      if (downDebounce === true) {
        tmbUI.rt = timeStamp;
        timeStamp = now();
        tmbUI.rt = timeStamp - tmbUI.rt;
        tmbUI.rt = tmbUI.rt.round(2);
        tmbUI.downTimestamp = timeStamp;

        if (tmbUI.timeoutRef) clearTimeout(tmbUI.timeoutRef);

        if (highlightEl) {
          if (['button', 'div', 'img', 'p', 'span'].includes(highlightEl.tagName.toLowerCase())) {
            elBorder = highlightEl.style.border;
            highlightEl.style.border = '5px solid ' + tmbUI.highlight; //#99ccff";
          } else if (
            ['circle', 'ellipse', 'image', 'line', 'path', 'polygon', 'polyline', 'rect', 'text'].includes(
              highlightEl.tagName.toLowerCase()
            )
          ) {
            elStroke = highlightEl.style.stroke;
            elStrokeWidth = highlightEl.style.strokeWidth;
            highlightEl.style.stroke = tmbUI.highlight;
            highlightEl.style.strokeWidth = 5;
          } else if (['shape'].includes(highlightEl.tagName.toLowerCase())) {
            elStroke = highlightEl.strokecolor;
            elStrokeWidth = highlightEl.strokeweight;
            highlightEl.strokecolor = tmbUI.highlight;
            highlightEl.strokeweight = 5;
          }
        }
      }
    }
  }

  function upResponseHandler(e) {
    var responseEvent;
    var MSetypes = ['', '', 'touch', 'pen', 'mouse'];

    responseEvent = e; // || window.event;

    responseEvent.preventDefault();
    responseEvent.stopPropagation();

    if (downDebounce === true) {
      tmbUI.upTimestamp = now();
      tmbUI.dwell = tmbUI.upTimestamp - timeStamp;
      tmbUI.dwell = tmbUI.dwell.round(2);

      tmbUI.status = responseEvent.type;
      if (responseEvent.type === 'pointerup') tmbUI.status += '-' + responseEvent.pointerType;
      else if (responseEvent.type === 'MSPointerUp') tmbUI.status += '-' + MSetypes[responseEvent.pointerType];

      removeHandlers();
      returnHandler();
    }
  }

  function installHandlers() {
    if (tmbUI.UIevents.includes('keys')) {
      document.addEventListener('keydown', downResponseHandler, true);
      document.addEventListener('keyup', upResponseHandler, true);
    }
    if (tmbUI.UIevents.includes('clicks')) {
      if (tmbUI.UIelements.length === 0) {
        if (window.PointerEvent) {
          document.body.addEventListener('pointerdown', downResponseHandler, true);
          document.body.addEventListener('pointerup', upResponseHandler, true);
        } else if (window.MSPointerEvent) {
          // IE10
          document.body.addEventListener('MSPointerDown', downResponseHandler, true);
          document.body.addEventListener('MSPointerUp', upResponseHandler, true);
        } else {
          document.addEventListener('mousedown', downResponseHandler, true);
          document.addEventListener('mouseup', upResponseHandler, true);
        }
      } else
        for (i = 0; i < tmbUI.UIelements.length; i++) {
          if (window.PointerEvent) {
            getID(tmbUI.UIelements[i]).addEventListener('pointerdown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).addEventListener('pointerup', upResponseHandler, true);
          } else if (window.MSPointerEvent) {
            // IE10
            getID(tmbUI.UIelements[i]).addEventListener('MSPointerDown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).addEventListener('MSPointerUp', upResponseHandler, true);
          } else {
            getID(tmbUI.UIelements[i]).addEventListener('mousedown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).addEventListener('mouseup', upResponseHandler, true);
          }
        }
    }
    if (tmbUI.UIevents.includes('taps')) {
      if (tmbUI.UIelements.length === 0) {
        if (window.PointerEvent && !tmbUI.UIevents.includes('clicks')) {
          document.addEventListener('pointerdown', downResponseHandler, true);
          document.addEventListener('pointerup', upResponseHandler, true);
        } else if (window.MSPointerEvent && !tmbUI.UIevents.includes('clicks')) {
          // IE10
          document.addEventListener('MSPointerDown', downResponseHandler, true);
          document.addEventListener('MSPointerUp', upResponseHandler, true);
        } else if (hasTouch && !hasPointer) {
          document.addEventListener('touchstart', downResponseHandler, true);
          document.addEventListener('touchend', upResponseHandler, true);
        }
      } else
        for (i = 0; i < tmbUI.UIelements.length; i++) {
          if (window.PointerEvent && !tmbUI.UIevents.includes('clicks')) {
            getID(tmbUI.UIelements[i]).addEventListener('pointerdown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).addEventListener('pointerup', upResponseHandler, true);
          } else if (window.MSPointerEvent && !tmbUI.UIevents.includes('clicks')) {
            // IE10
            getID(tmbUI.UIelements[i]).addEventListener('MSPointerDown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).addEventListener('MSPointerUp', upResponseHandler, true);
          } else if (hasTouch && !hasPointer) {
            getID(tmbUI.UIelements[i]).addEventListener('touchstart', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).addEventListener('touchend', upResponseHandler, true);
          }
        }
    }
  }

  function removeHandlers() {
    if (tmbUI.UIevents.includes('keys')) {
      document.removeEventListener('keydown', downResponseHandler, true);
      document.removeEventListener('keyup', upResponseHandler, true);
    }
    if (tmbUI.UIevents.includes('clicks')) {
      if (tmbUI.UIelements.length === 0) {
        if (window.PointerEvent) {
          document.body.removeEventListener('pointerdown', downResponseHandler, true);
          document.body.removeEventListener('pointerup', upResponseHandler, true);
        } else if (window.MSPointerEvent) {
          // IE10
          document.body.removeEventListener('MSPointerDown', downResponseHandler, true);
          document.body.removeEventListener('MSPointerUp', upResponseHandler, true);
        } else {
          document.removeEventListener('mousedown', downResponseHandler, true);
          document.removeEventListener('mouseup', upResponseHandler, true);
        }
      } else
        for (i = 0; i < tmbUI.UIelements.length; i++) {
          if (window.PointerEvent) {
            getID(tmbUI.UIelements[i]).removeEventListener('pointerdown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).removeEventListener('pointerup', upResponseHandler, true);
          } else if (window.MSPointerEvent) {
            // IE10
            getID(tmbUI.UIelements[i]).removeEventListener('MSPointerDown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).removeEventListener('MSPointerUp', upResponseHandler, true);
          } else {
            getID(tmbUI.UIelements[i]).removeEventListener('mousedown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).removeEventListener('mouseup', upResponseHandler, true);
          }
        }
    }
    if (tmbUI.UIevents.includes('taps')) {
      if (tmbUI.UIelements.length === 0) {
        if (window.PointerEvent && !tmbUI.UIevents.includes('clicks')) {
          document.removeEventListener('pointerdown', downResponseHandler, true);
          document.removeEventListener('pointerup', upResponseHandler, true);
        } else if (window.MSPointerEvent && !tmbUI.UIevents.includes('clicks')) {
          // IE10
          document.removeEventListener('MSPointerDown', downResponseHandler, true);
          document.removeEventListener('MSPointerUp', upResponseHandler, true);
        } else if (hasTouch && !hasPointer) {
          document.removeEventListener('touchstart', downResponseHandler, true);
          document.removeEventListener('touchend', upResponseHandler, true);
        }
      } else
        for (i = 0; i < tmbUI.UIelements.length; i++) {
          if (window.PointerEvent && !tmbUI.UIevents.includes('clicks')) {
            getID(tmbUI.UIelements[i]).removeEventListener('pointerdown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).removeEventListener('pointerup', upResponseHandler, true);
          } else if (window.MSPointerEvent && !tmbUI.UIevents.includes('clicks')) {
            // IE10
            getID(tmbUI.UIelements[i]).removeEventListener('MSPointerDown', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).removeEventListener('MSPointerUp', upResponseHandler, true);
          } else if (hasTouch && !hasPointer) {
            getID(tmbUI.UIelements[i]).removeEventListener('touchstart', downResponseHandler, true);
            getID(tmbUI.UIelements[i]).removeEventListener('touchend', upResponseHandler, true);
          }
        }
    }
  }

  function returnHandler() {
    if (tmbUI.timeoutRef) {
      clearTimeout(tmbUI.timeoutRef);
      tmbUI.timeoutRef = 0;
    }

    if (highlightEl) {
      setTimeout(function () {
        if (['button', 'div', 'img', 'p', 'span'].includes(highlightEl.tagName.toLowerCase()))
          highlightEl.style.border = elBorder;
        else if (
          ['circle', 'ellipse', 'image', 'line', 'path', 'polygon', 'polyline', 'rect', 'text'].includes(
            highlightEl.tagName.toLowerCase()
          )
        ) {
          highlightEl.style.stroke = elStroke;
          highlightEl.style.strokeWidth = elStrokeWidth;
        } else if (['shape'].includes(highlightEl.tagName.toLowerCase())) {
          highlightEl.strokecolor = elStroke;
          highlightEl.strokeweight = elStrokeWidth;
        }

        var readyUI = new CustomEvent('readyUI');
        document.addEventListener('readyUI', tmbUI.onreadyUI, true);
        document.dispatchEvent(readyUI);
        document.removeEventListener('readyUI', tmbUI.onreadyUI, true);
      }, 250);
    } else {
      var readyUI = new CustomEvent('readyUI');
      document.addEventListener('readyUI', tmbUI.onreadyUI, true);
      document.dispatchEvent(readyUI);
      document.removeEventListener('readyUI', tmbUI.onreadyUI, true);
    }
  }

  tmbUI.timeoutRef = setTimeout(function () {
    tmbUI.status = 'timeout';
    tmbUI.message += 'Timeout: no response in ' + tmbUI.timeout + ' ms.';
    removeHandlers();
    returnHandler();
  }, tmbUI.timeout);

  installHandlers();

  return false;
};

const keyboardCodes = Object.freeze({
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'control',
  18: 'alt',
  19: 'pause',
  20: 'capslock',
  27: 'escape',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'insert',
  46: 'delete',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  59: ';',
  61: '=',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
  91: 'OSleft',
  92: 'OSright',
  93: 'OSright',
  96: 'numpad0',
  97: 'numpad1',
  98: 'numpad2',
  99: 'numpad3',
  100: 'numpad4',
  101: 'numpad5',
  102: 'numpad6',
  103: 'numpad7',
  104: 'numpad8',
  105: 'numpad9',
  106: 'numpadmultiply',
  107: 'numpadadd',
  109: 'numpadsubtract',
  110: 'numpaddecimal',
  111: 'numpaddivide',
  112: 'f1',
  113: 'f2',
  114: 'f3',
  115: 'f4',
  116: 'f5',
  117: 'f6',
  118: 'f7',
  119: 'f8',
  120: 'f9',
  121: 'f10',
  122: 'f11',
  123: 'f12',
  124: 'f13',
  125: 'f14',
  126: 'f15',
  144: 'numlock',
  145: 'scrolllock',
  173: '-',
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
  222: "'",
  224: 'command'
});

function codeToKey(code) {
  return keyboardCodes[code] || 'nokey';
}

/** @deprecated - alias compatible with zen.js */
const keyValue = codeToKey;

function getKeyboardInput(acceptedKeys, fun, state, duration) {
  if (!(acceptedKeys['highlight'] === true || acceptedKeys instanceof Array || acceptedKeys === 'any'))
    throw new TypeError('getKeyboardInput: invalid acceptedKeys parameter');

  var highlight = acceptedKeys['highlight'] === true ? true : false;

  if (duration) setTimeout(disableKeyboard, duration);
  var startTime = now();

  var keyPressedDown = null;
  var responseTime = 0;

  var clearKeyboardInput = function () {
    keyPressedDown = null;
    if (highlight) {
      for (var key in acceptedKeys) {
        if (Object.prototype.hasOwnProperty.call(acceptedKeys, key) && key !== 'highlight')
          acceptedKeys[key].style.border = '5px solid transparent';
      }
    }
  };

  document.onkeydown = function (e) {
    responseTime = now() - startTime;
    e = e || window.event;

    var v = e.charCode || e.keyCode;
    var value = codeToKey(v);

    if (
      acceptedKeys === 'any' ||
      (highlight && value in acceptedKeys) ||
      (acceptedKeys instanceof Array && acceptedKeys.includes(value))
    ) {
      if (!keyPressedDown || keyPressedDown === value) {
        keyPressedDown = value;

        if (highlight && acceptedKeys[value]) acceptedKeys[value].style.border = '5px solid #afd6fd';
      } else {
        clearKeyboardInput();
        // eslint-disable-next-line no-alert
        alert('Please press only one key!\n\n' + 'Your response was not recorded. Please try again.');
        clearKeyboardInput();
      }
    }

    return false;
  };

  document.onkeyup = function (e) {
    e = e || window.event;

    var v = e.charCode || e.keyCode;
    var value = codeToKey(v);

    if (
      acceptedKeys === 'any' ||
      (highlight && value in acceptedKeys) ||
      (acceptedKeys instanceof Array && acceptedKeys.contains(value))
    ) {
      if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        e.returnValue = false;
        e.cancelBubble = true;
      }

      var event_handler_helper = function () {
        if (value !== keyPressedDown) return false;

        if (highlight) acceptedKeys[value].style.border = '5px solid transparent';

        var input = { response: value, rt: responseTime };

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

function simulateMobileMouse(el) {
  el.addEventListener('touchstart', mobileTouchHandler);
  el.addEventListener('touchmove', mobileTouchHandler);
  el.addEventListener('touchend', mobileTouchHandler);
  el.addEventListener('touchcancel', mobileTouchHandler);
}

function mobileTouchHandler(ev) {
  ev.preventDefault();

  switch (ev.type) {
    case 'touchstart':
      if (ev.changedTouches.length !== 1) return;
      this.touchMoved = false;
      simulateMobileMouseEvent(ev, 'mouseover');
      simulateMobileMouseEvent(ev, 'mousemove');
      simulateMobileMouseEvent(ev, 'mousedown');
      break;
    case 'touchmove':
      if (ev.changedTouches.length !== 1) return;
      this.touchMoved = true;
      simulateMobileMouseEvent(ev, 'mousemove');
      break;
    case 'touchend':
      if (ev.changedTouches.length !== 1) return;
      simulateMobileMouseEvent(ev, 'mouseup');
      simulateMobileMouseEvent(ev, 'mouseout');
      if (!this.touchMoved) simulateMobileMouseEvent(ev, 'click');
      break;
    default:
      return;
  }
}

function simulateMobileMouseEvent(event, type) {
  var mouse_ev = document.createEvent('MouseEvents');

  var touch = event.changedTouches[0];

  mouse_ev.initMouseEvent(
    type, // type of event
    true, // can bubble?
    true, // cancelable?
    window, // event view
    1, // mouse click count
    touch.screenX, // event's screen x-coordinate
    touch.screenY, // event's screen y-coordinate
    touch.clientX, // event's client x-coordinate
    touch.clientY, // event's client y-coordinate
    event.ctrlKey, // control key was pressed?
    event.altKey, // alt key was pressed?
    event.shiftKey, // shift key was pressed?
    event.metaKey, // meta key was pressed?
    0, // mouse button
    null // related target
  );

  event.target.dispatchEvent(mouse_ev);
}

function simulateKeyEvent(keyevent, keycode) {
  var customKeyEvent = null;

  if (document.createEvent) {
    try {
      customKeyEvent = document.createEvent('KeyEvents');

      customKeyEvent.initKeyEvent(
        keyevent, // type of event
        true, // can bubble?
        true, // cancelable?
        window, // event view
        false, // includes CTRl key?
        false, // includes ALT key?
        false, // includes SHIFT key?
        false, // includes META key?
        keycode, // keycode
        0
      ); // charcode
    } catch (ex /*:Error*/) {
      try {
        customKeyEvent = document.createEvent('Events');
      } catch (uierror /*:Error*/) {
        customKeyEvent = document.createEvent('UIEvents');
      } finally {
        customKeyEvent.initEvent(
          keyevent, // type of event
          true, // can bubble?
          true
        ); // cancelable?
        customKeyEvent.view = window;
        customKeyEvent.altKey = false;
        customKeyEvent.ctrlKey = false;
        customKeyEvent.shiftKey = false;
        customKeyEvent.metaKey = false;
        customKeyEvent.keyCode = keycode;
        customKeyEvent.charCode = 0;
      }
    }
    document.dispatchEvent(customKeyEvent);
  } else if (document.createEventObject) {
    //IE
    customKeyEvent = document.createEventObject();

    customKeyEvent.bubbles = true;
    customKeyEvent.cancelable = true;
    customKeyEvent.view = window;
    customKeyEvent.ctrlKey = false;
    customKeyEvent.altKey = false;
    customKeyEvent.shiftKey = false;
    customKeyEvent.metaKey = false;
    customKeyEvent.keyCode = keycode;

    document.fireEvent('on' + keyevent, customKeyEvent);
  } else {
    throw 'simulateKeyEvent(): No event simulation framework present.';
  }
}

const keyboardKeys = {
  ' ': 32,
  "'": 222,
  ',': 188,
  '.': 190,
  '/': 191,
  ';': 186,
  '=': 187,
  '[': 219,
  '\\': 220,
  ']': 221,
  '`': 192,
  '-': 189,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  OSleft: 91,
  OSright: 92,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  Windows: 91,
  X: 88,
  Y: 89,
  Z: 90,
  a: 65,
  alt: 18,
  b: 66,
  backquote: 192,
  backslash: 220,
  backspace: 8,
  bracketleft: 219,
  bracketright: 221,
  c: 67,
  capslock: 20,
  comma: 188,
  command: 224,
  commandleft: 91,
  commandright: 93,
  control: 17,
  ctrl: 17,
  d: 68,
  delete: 46,
  down: 40,
  downarrow: 40,
  e: 69,
  end: 35,
  enter: 13,
  equal: 187,
  esc: 27,
  escape: 27,
  f: 70,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  f13: 124,
  f14: 125,
  f15: 126,
  g: 71,
  h: 72,
  home: 36,
  i: 73,
  insert: 45,
  j: 74,
  k: 75,
  l: 76,
  left: 37,
  leftarrow: 37,
  m: 77,
  minus: 189,
  n: 78,
  numlock: 144,
  numpad0: 96,
  numpad1: 97,
  numpad2: 98,
  numpad3: 99,
  numpad4: 100,
  numpad5: 101,
  numpad6: 102,
  numpad7: 103,
  numpad8: 104,
  numpad9: 105,
  numpadadd: 107,
  numpaddecimal: 110,
  numpaddivide: 111,
  numpadmultiply: 106,
  numpadsubtract: 109,
  o: 79,
  p: 80,
  pagedown: 34,
  pageup: 33,
  pause: 19,
  period: 190,
  q: 81,
  quote: 222,
  r: 82,
  return: 13,
  right: 39,
  rightarrow: 39,
  s: 83,
  scrolllock: 145,
  semicolon: 186,
  shift: 16,
  slash: 191,
  space: 32,
  spacebar: 32,
  t: 84,
  tab: 9,
  u: 85,
  up: 38,
  uparrow: 38,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90
};

function keyToCode(key) {
  return keyboardKeys[key] || 0;
}

function disableKeyboard() {
  document.onkeyup = null;
  document.onkeydown = null;
}

function disableTouch(objs) {
  if (objs === 'document') {
    document.ontouchend = null;
  } else {
    for (var i = 0; i < objs.length; i++) {
      objs[i].ontouchstart = null;
      objs[i].ontouchend = null;
    }
  }
}

function disableSelect() {
  var s = document.body.style;

  if (typeof s.webkitUserSelect !== 'undefined') s.webkitUserSelect = 'none';
  else if (typeof s.MozUserSelect !== 'undefined') s.MozUserSelect = 'none';
  else if (typeof s.msUserSelect !== 'undefined') s.msUserSelect = 'none';
  else if (typeof s.oUserSelect !== 'undefined') s.oUserSelect = 'none';
  else if (typeof s.userSelect !== 'undefined') s.userSelect = 'none';
  else if (typeof document.onselectstart !== 'undefined')
    document.onselectstart = function () {
      return false;
    };
}

function disableRightClick() {
  if (typeof document.oncontextmenu !== 'undefined')
    document.oncontextmenu = function () {
      return false;
    };
}

function disableDrag() {
  if (typeof document.ondragstart !== 'undefined')
    document.ondragstart = function () {
      return false;
    };
}

function disableElasticScrolling() {
  if (typeof document.ontouchmove !== 'undefined')
    document.ontouchmove = function (e) {
      e.preventDefault();
      e.stopPropagation();
    };
}

function disableDoubleTapZoom() {
  if ('touchAction' in document.body.style) {
    document.body.style.touchAction = 'manipulation';
  } else if ('msTouchAction' in document.body.style) {
    document.body.style.msTouchAction = 'manipulation';
  }
}

function getWindowHeight() {
  var y = 0;
  if (self.innerHeight) {
    y = self.innerHeight;
  } else if (document.documentElement && document.documentElement.clientHeight) {
    y = document.documentElement.clientHeight;
  } else if (document.body) {
    y = document.body.clientHeight;
  }
  return y;
}

function getWindowWidth() {
  var x = 0;
  if (self.innerWidth) {
    x = self.innerWidth;
  } else if (document.documentElement && document.documentElement.clientWidth) {
    x = document.documentElement.clientWidth;
  } else if (document.body) {
    x = document.body.clientWidth;
  }
  return x;
}

function getAspectRatio() {
  return screen.height < screen.width ? screen.width / screen.height : screen.height / screen.width;
}

function getBoundingClientRectWithScroll(el) {
  var box = el.getBoundingClientRect();
  var body = document.body;
  var docElem = document.documentElement;

  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;
  var right = box.right + scrollLeft - clientLeft;
  var bottom = box.bottom + scrollTop - clientTop;
  var height = box.bottom - box.top;
  var width = box.right - box.left;

  return {
    bottom: Math.round(bottom),
    height: Math.round(height),
    left: Math.round(left),
    right: Math.round(right),
    top: Math.round(top),
    width: Math.round(width)
  };
}

function regularPolygon(nv, cx, cy, cr, theta) {
  if (nv < 3) return;
  var vertices = [];
  var a = (Math.PI * 2) / nv;
  theta = (theta * Math.PI) / 180;

  for (var i = 0; i < nv; i++) {
    vertices.push({ x: cx + cr * Math.cos(i * a + theta), y: cy - cr * Math.sin(i * a + theta) });
  }
  return vertices;
}

function svgPathString(vxy, closedPath) {
  var svgPath;
  svgPath = 'M' + vxy[0].x + ' ' + vxy[0].y + 'L';
  for (var i = 1; i < vxy.length; i++) {
    svgPath = svgPath + vxy[i].x + ' ' + vxy[i].y + ' ';
  }
  if (closedPath) svgPath = svgPath + 'Z';
  return svgPath;
}

function randInt(a, b) {
  if (!b) {
    a = a || 2;
    return Math.floor(Math.random() * a);
  } else {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }
}
// export var coinFlip = randInt; // alias compatible with zen.js

function randSign() {
  if (Math.random() < 0.5) return -1;
  else return 1;
}

function combinations(arr, k) {
  var i,
    subI,
    ret = [],
    sub,
    next;
  for (i = 0; i < arr.length; i++) {
    if (k === 1) {
      ret.push([arr[i]]);
    } else {
      sub = combinations(arr.slice(i + 1, arr.length), k - 1);
      for (subI = 0; subI < sub.length; subI++) {
        next = sub[subI];
        next.unshift(arr[i]);
        ret.push(next);
      }
    }
  }
  return ret;
}

function range(m, n) {
  var a = [];
  for (var i = m; i <= n; i++) a.push(i);
  return a;
}

function linSpace(a, b, n) {
  if (typeof n === 'undefined') n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i,
    ret = new Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}

function isEven(n) {
  return n === parseFloat(n) ? !(n % 2) : void 0;
}

function wrapRads(r) {
  while (r > Math.PI) r -= 2 * Math.PI;
  while (r < -Math.PI) r += 2 * Math.PI;
  return r;
}

function sizeToDegrees(size, viewingDistance) {
  viewingDistance = viewingDistance || 57.294;
  return (2 * Math.atan2(size, 2 * viewingDistance) * 180) / Math.PI;
}
var centimetersToDegrees = sizeToDegrees; // alias compatible with zen.js

function degreesToSize(degrees, viewingDistance) {
  viewingDistance = viewingDistance || 57.294;
  return 2 * viewingDistance * Math.tan((degrees * Math.PI) / 360);
}
var degreesToCentimeters = degreesToSize; // alias compatible with zen.js

function euclidDistance(x1, y1, x2, y2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function euclidDistanceSquared(x1, y1, x2, y2) {
  var dx, dy;
  dx = x1 - x2;
  dy = y1 - y2;
  return dx * dx + dy * dy;
}

function vecPvector(p1, p2) {
  var result = {};
  result.x = p2.x - p1.x;
  result.y = p2.y - p1.y;
  return result;
}

function vecLength(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function vecAngle(v) {
  var radAngle = Math.atan2(v.y, v.x);
  return wrapRads(radAngle);
}

function vecDotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function vecCrossProduct(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x;
}

function vecAngleBetween(v1, v2) {
  var radAngle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
  // returns the rotation in radians of v2 relative to v1,
  // positive CCW, negative CW
  return wrapRads(radAngle);
}

function segmentsIntersect(p1, p2, p3, p4) {
  function pointsOverlap(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  }

  function allEqual() {
    var firstValue = arguments[0];

    for (var i = 1; i < arguments.length; i += 1) {
      if (arguments[i] !== firstValue) return false;
    }
    return true;
  }

  var q = vecPvector(p1, p3);
  var r = vecPvector(p1, p2);
  var s = vecPvector(p3, p4);

  var commonDenominator = vecCrossProduct(r, s);
  var betaNumerator = vecCrossProduct(q, r);

  if (commonDenominator === 0) {
    if (betaNumerator === 0) {
      if (
        !allEqual(p3.x - p1.x < 0, p3.x - p2.x < 0, p4.x - p1.x < 0, p4.x - p2.x < 0) ||
        !allEqual(p3.y - p1.y < 0, p3.y - p2.y < 0, p4.y - p1.y < 0, p4.y - p2.y < 0)
      )
        return 1;
      else if (pointsOverlap(p1, p3) || pointsOverlap(p1, p4) || pointsOverlap(p2, p3) || pointsOverlap(p2, p4))
        return 2;
    }

    return 0;
  }

  var alphaNumerator = vecCrossProduct(q, s);

  var u = betaNumerator / commonDenominator;
  var t = alphaNumerator / commonDenominator;

  if ((t === 0 || t === 1) && (u === 0 || u === 1)) return 3;
  else if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 4;

  return 0;
}

function pointSegmentDistance(p0, s1, s2) {
  function dist2(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;

    return dx * dx + dy * dy;
  }

  var l2 = dist2(s1, s2);

  if (l2 === 0) return Math.sqrt(dist2(p0, s1));

  var t = ((p0.x - s1.x) * (s2.x - s1.x) + (p0.y - s1.y) * (s2.y - s1.y)) / l2;

  if (t < 0) return Math.sqrt(dist2(p0, s1));

  if (t > 1) return Math.sqrt(dist2(p0, s2));

  return Math.sqrt(dist2(p0, { x: s1.x + t * (s2.x - s1.x), y: s1.y + t * (s2.y - s1.y) }));
}

function polygonIsComplex(pn) {
  var isect, len;
  if ((len = pn.length) > 2) {
    for (var i = 1; i < len - 1; i++) {
      for (var j = 0; j < i; j++) {
        isect = segmentsIntersect(pn[j], pn[j + 1], pn[i], pn[i + 1]);
        if (isect !== 0 && isect !== 3) return [isect, j, i];
      }
    }
    for (j = 0; j < len - 1; j++) {
      isect = segmentsIntersect(pn[j], pn[j + 1], pn[len - 1], pn[0]);
      if (isect !== 0 && isect !== 3) return [isect, j, len - 1];
    }
  }
  return false;
}

function autoCorr(series, hiLag) {
  var i, j, len, buffer;
  var avg,
    denom = 0,
    num = 0,
    aCorr = [];
  if (hiLag < 1 || hiLag > series.length - 1)
    throw new TypeError("'hiLag' must be positive and less than 'series.length'.");
  buffer = series.slice();

  len = buffer.length;
  avg = buffer.average();

  for (i = 0; i < len; i++) {
    buffer[i] = buffer[i] - avg;
    denom += buffer[i] * buffer[i];
  }

  aCorr[0] = 1;

  for (j = 1; j < hiLag + 1; j++) {
    num = 0;
    for (i = 0; i < len - j - 1; i++) num += buffer[i] * buffer[i + j];
    aCorr[j] = num / denom;
  }

  return aCorr;
}

function now() {
  var performance = window.performance || {};
  performance.now = (function () {
    return (
      performance.now ||
      performance.webkitNow ||
      performance.msNow ||
      performance.oNow ||
      performance.mozNow ||
      function () {
        return new Date().getTime();
      }
    );
  })();
  return performance.now();
}

// function getTimerGrain(ticks, callBack) {
//   var lags = [],
//     totalTime,
//     totalTicks,
//     remainder,
//     chunk;

//   function measureGrain() {
//     var start, timestamp, count, timerInterval, index;

//     count = chunk;
//     index = lags.length + 1;
//     timestamp = start = now();

//     while (count) {
//       timerInterval = now();
//       if ((lags[index] = timerInterval - timestamp)) {
//         count--;
//         index++;
//         timestamp = timerInterval;
//       }
//     }

//     totalTime += timestamp - start;
//     totalTicks += chunk;

//     if (totalTicks === ticks) {
//       timerInterval = lags.median().round(7);
//       callBack(timerInterval);
//     } else {
//       if (totalTicks === ticks - remainder) chunk = remainder;

//       setImmediate(measureGrain);
//     }
//   }

//   if (ticks && callBack) {
//     totalTime = totalTicks = 0;

//     if (ticks > 100) {
//       chunk = 100;
//       remainder = ticks % 100;
//     } else chunk = ticks;

//     setImmediate(measureGrain);
//   } else
//     console.log("getTimerGrain needs how many 'ticks' to measure " + "and a 'callBack' function to return the result.");
// }

function chainTimeouts() {
  let args = arguments;

  var nArgs = args.length;
  var start = args[0];

  // accept a single array as the argument

  if (nArgs === 1 && start instanceof Array) {
    args = start;
    nArgs = args.length;
    start = args[0];
  }

  // require an odd number of arguments
  if (nArgs % 2 === 0) throw new Error('chainTimeouts(): number of arguments must be odd');

  // execute the first argument immediately
  start();

  // set up timeouts for each even argument
  var timeoutsChain = [];
  for (var i = 2, execute_time = args[1]; i < nArgs; i += 2, execute_time += args[i - 1]) {
    timeoutsChain.push(setTimeout(args[i], execute_time));
  }

  return timeoutsChain;
}
const chain = chainTimeouts; // alias compatible with zen.js

function clearChainTimeouts(a) {
  for (var i = 0, len = a.length; i < len; i++) clearTimeout(a[i]);
}
const clearChain = clearChainTimeouts; // alias compatible with zen.js

function getAllCookies() {
  var cookies = {};
  if (document.cookie && document.cookie != '') {
    var split = document.cookie.split('; ');
    for (var i = 0; i < split.length; i++) {
      var nameValue = split[i].split(/=(.+)?/);
      cookies[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
    }
  }
  return cookies;
}

function createCookie(name, value, expire, path, domain, secure) {
  if (!name) return false;
  value = value ? value : '';
  if (expire !== undefined) {
    var date = new Date();
    date.setTime(date.getTime() + expire * 24 * 60 * 60 * 1000);
    expire = '; expires=' + date.toUTCString();
  } else expire = '; expires=0';
  path = path ? '; path=' + path : '; path=/';
  domain = domain ? '; domain=' + domain : '';
  secure = secure || location.protocol === 'https:' ? ';secure' : '';
  document.cookie = name + '=' + value + expire + path + domain + secure;
}

function readCookie(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name, path, domain) {
  path = path ? '; path=' + path : '';
  domain = domain ? '; domain=' + domain : '';
  createCookie(name, '', -1, path, domain);
}

function safeDecode(s) {
  s = s.replace(/!/g, '/').replace(/-/g, '+').replace(/\./g, '=');
  return atob(s);
}
const urlsafedecode = safeDecode; // alias compatible with zen.js

function safeEncode(s) {
  s = btoa(s);
  s = s.replace(/\//g, '!').replace(/\+/g, '-').replace(/=/g, '.');
  return s;
}

function getPastResults(test) {
  return RawDeflate.inflate(safeDecode(readCookie('t.' + test)));
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// function generateForm(survey, node, action, method, buttonText) {
//   var self = generateForm;

//   function tag(kind, options) {
//     var str = '<' + kind + ' ';
//     var optStr = [];
//     for (var i in options) {
//       if (options.hasOwnProperty(i) && i !== 'content') optStr.push(i + '=' + '"' + options[i] + '"');
//     }
//     str += optStr.join(' ') + '>';
//     if (typeof options.content !== 'undefined') {
//       str += options.content;
//     }
//     str += '</' + kind + '>';
//     return str;
//   }

//   if (typeof self.numForms === 'undefined') {
//     self.numForms = 1;
//   } else {
//     self.numForms++;
//   }

//   var formId = '__form' + (self.numForms - 1);
//   method === undefined ? (method = 'POST') : (method = method);
//   onsubmit = "alert('blart');";
//   var str = "<form id='" + formId + "' action='" + action + "' method='" + method + "'><ol>";
//   for (var a = 0, b; (b = survey[a]); a++) {
//     if (b.type === 'textdiv') {
//       b.optional = true;
//       str += tag('div', { id: b.name, size: b.length, content: b.content, class: 'zen_infoblock' });
//       continue;
//     }

//     if (b.question !== '') {
//       str += b.type !== ('hidden' || 'text') ? '<li>' : '';
//       str +=
//         "<p><div class='zen_question zen_" +
//         b.type +
//         "' id='zen_" +
//         b.name +
//         "_question'>" +
//         b.question +
//         "</div><div class='zen_input zen_" +
//         b.type +
//         (typeof b.subtype !== 'undefined' ? ' zen_' + b.subtype : '') +
//         "' id='zen_" +
//         b.name +
//         "_input'>";
//     }

//     switch (b.type) {
//       case '':
//         str += tag('input', { type: 'text', id: b.name });
//         break;
//       case 'text':
//         str += tag('input', { type: 'text', maxlength: b.length, id: b.name, size: b.length });
//         break;
//       case 'hidden':
//         b.optional = true;
//         b.question = b.name;
//         str += tag('input', { type: 'hidden', id: b.name });
//         break;
//       case 'checkbox':
//       case 'radio':
//         b.options.map(function (o, i) {
//           var id = b.name + '[' + i + ']';
//           str += tag('span', {
//             class: typeof b.subtype !== 'undefined' ? 'zen_' + b.subtype : 'zen_' + b.type,
//             content:
//               tag('input', {
//                 type: b.type,
//                 name: b.name,
//                 id: id,
//                 value: typeof b.values !== 'undefined' ? b.values[i] : b.options[i],
//                 class: 'zen_' + b.type
//               }) + tag('label', { for: id, content: o })
//           });
//         });
//         break;
//       case 'dropdown':
//         str += "<select id='" + b.name + "' name= '" + b.name + "'>";
//         b.options.map(function (o, i) {
//           var id = b.name + '[' + i + ']';
//           str += tag('option', {
//             type: b.type,
//             content: o,
//             id: id,
//             value: typeof b.values !== 'undefined' ? b.values[i] : b.options[i],
//             class: 'zen_' + b.type
//           });
//           str =
//             str.substring(0, str.lastIndexOf('"') + 1) +
//             (b.selected === b.options[i] ? " selected='selected' " : ' ') +
//             str.substring(str.lastIndexOf('"') + 1);
//         });
//         str += '</select>';
//         break;
//       case 'textarea':
//         str += tag('textarea', {
//           name: b.name,
//           rows: b.rows,
//           cols: b.cols,
//           id: b.name,
//           class: typeof b.subtype !== 'undefined' ? ' zen_' + b.subtype : ''
//         });
//         break;
//     }

//     str += '</div></p>';
//     str += b.type !== 'hidden' ? '</li>' : '';
//   }
//   if (buttonText) {
//     str =
//       str +
//       "<br /><button type='button' id='zen_submit' onclick='document.forms." +
//       formId +
//       ".validate();'>" +
//       buttonText +
//       '</button>';
//   } else {
//     str =
//       str +
//       "<br /><button type='button' id='zen_submit' onclick='document.forms." +
//       formId +
//       ".validate();'>Next</button>";
//   }
//   str += "<input type='hidden' name='data' id='data' /><input type='hidden' name='score' id='score'/></form>";
//   node.innerHTML += str;

//   getID(formId).validate = function () {
//     var results = [];
//     var score = 0;
//     var finalCheck = true;
//     var error = false;
//     var form = getID(formId);
//     survey.map(function (item) {
//       var id = item.name;

//       var el, value, answer;

//       if (item.type === 'checkbox' || item.type === 'radio') {
//         value = [];
//         for (var i = 0, len = item.options.length; i < len; i++) {
//           var option = getID(item.name + '[' + i + ']');
//           if (option.checked) {
//             value.push(option.value);
//             if (item.values) {
//               score += option.value * 1;
//             }
//           }
//         }

//         if (item.type === 'radio') {
//           value = value.shift();
//           item.validate = function (o) {
//             return o;
//           };
//         } else {
//           item.validate = function (o) {
//             return o.length;
//           };
//         }
//         answer = value;
//         el = getID(item.name + '[' + (i - 1) + ']');
//       } else if (item.type === 'dropdown') {
//         for (var i = 0, len = item.options.length; i < len; i++) {
//           var option = getID(item.name + '[' + i + ']');
//           if (option.selected) {
//             //value = option.value*1;
//             answer = option.value;
//             if (item.values) {
//               answer = option.value * 1;
//               score += option.value * 1;
//             }
//           }
//         }
//         el = form[item.name];
//         value = getID(item.name).options[0].selected;
//         value = !value;
//         item.validate = function (o) {
//           return o;
//         };
//       } else {
//         value = [];
//         el = form[item.name] ? form[item.name] : getID(item.name);
//         value = el.value;
//         answer = el.value;
//       }

//       if (!item.optional /*&& !item.text*/) {
//         var errorEl = getID(id + '.err');

//         if (!errorEl) {
//           errorEl = document.createElement('span');
//           errorEl.id = id + '.err';
//           errorEl.className = 'zen_error';
//           insertAfter(getID('zen_' + id + '_input'), errorEl);
//         }

//         var notBlank = function (val) {
//           return !(val === '');
//         };
//         var validate = item.validate || notBlank;

//         if (!validate(value)) {
//           error = true;
//           finalCheck = false;
//           errorEl.innerHTML = 'required';
//         } else {
//           errorEl.innerHTML = '';
//           var ans = new Object();
//           eval('ans.zen_' + item.name + '= answer');
//           results.push(ans);
//           //results.push({ eval(item.name) : answer});
//         }
//       } else {
//         var ans = new Object();
//         eval('ans.zen_' + item.name + '= answer');
//         results.push(ans);
//       }
//     });

//     var errorTot = getID(formId + '.err');

//     if (!errorTot) {
//       errorTot = document.createElement('span');
//       errorTot.id = formId + '.err';
//       errorTot.className = 'zen_err_flag';
//       insertAfter(getID('zen_submit'), errorTot);
//     }

//     getID('data').value = JSON.stringify(results);
//     getID('score').value = isNaN(score) ? 0 : score;
//     if (finalCheck) {
//       getID(formId).submit();
//     } else {
//       errorTot.innerHTML =
//         'There is a problem with your form submission.  Please check that you have filled out all required fields correctly.';
//       return finalCheck;
//     }
//   };
// }

/** This was previously a side effect - JU */
function attachLoadingSlide() {
  let ____loadingSlide;
  ____loadingSlide = document.createElement('div');
  ____loadingSlide.id = '____loading_slide';
  ____loadingSlide.style.display = 'none';
  ____loadingSlide.style.textAlign = 'center';
  ____loadingSlide.style.paddingTop = '40px';
  ____loadingSlide.style.fontWeight = 'bold';
  ____loadingSlide.style.fontSize = 'x-large';
  ____loadingSlide.innerHTML = 'Working....';

  let loadInterval = setInterval(function () {
    if (document.readyState !== 'loading') {
      clearInterval(loadInterval);
      document.body.appendChild(____loadingSlide);
    }
  }, 100);

  window.addEventListener(
    'beforeunload',
    function () {
      showFrame('____loading_slide');
    },
    true
  );
}

export {
  $$$,
  ajaxRequest,
  attachLoadingSlide,
  autoCorr,
  centimetersToDegrees,
  chain,
  chainTimeouts,
  chooseInput,
  clearChain,
  clearChainTimeouts,
  codeToKey,
  combinations,
  createCookie,
  degreesToCentimeters,
  degreesToSize,
  disableDoubleTapZoom,
  disableDrag,
  disableElasticScrolling,
  disableKeyboard,
  disableRightClick,
  disableSelect,
  disableTouch,
  eraseCookie,
  euclidDistance,
  euclidDistanceSquared,
  fixMobileOrientation,
  fixOrientation,
  getAllCookies,
  getAspectRatio,
  getBoundingClientRectWithScroll,
  getID,
  getKeyboardInput,
  getPastResults,
  getUrlParameters,
  getWindowHeight,
  getWindowWidth,
  hasPointer,
  hasTouch,
  hideCursor,
  httpBuildQuery,
  imagePreLoad,
  injectScript,
  insertAfter,
  isEven,
  keyToCode,
  keyValue,
  keyboardCodes,
  keyboardKeys,
  linSpace,
  logResults,
  mobileTouchHandler,
  now,
  pointSegmentDistance,
  polygonIsComplex,
  randInt,
  randSign,
  range,
  readCookie,
  regularPolygon,
  safeDecode,
  safeEncode,
  segmentsIntersect,
  setMobileViewportScale,
  showAlert,
  showCursor,
  showFrame,
  showFrameClass,
  showSlide,
  simulateKeyEvent,
  simulateMobileMouse,
  simulateMobileMouseEvent,
  sizeToDegrees,
  svgPathString,
  tmbObjs,
  tmbSubmitToFile,
  tmbSubmitToServer,
  tmbSubmitToURL,
  tmbUI,
  urlEncode,
  urlsafedecode,
  vecAngle,
  vecAngleBetween,
  vecCrossProduct,
  vecDotProduct,
  vecLength,
  vecPvector,
  wrapRads,
  zen
};
