(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],5:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":3,"./encode":4}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":6,"FWaASH":2,"inherits":1}],8:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],9:[function(require,module,exports){
var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Rectangle = require('./rectangle');

var COLOR = [0, 0, 0];

var rgba = function(color, alpha) {
	return util.format('rgba(%s, %s, %s, %s)', color[0], color[1], color[2], alpha);
};

var Base = function(game, options) {
	options = options || {};

	this.game = game;

	this.position = options.position || { x: 0, y: 0 };
	this.size = options.size || { width: 0, height: 0 };
	this.direction = options.direction || 0;
	this.visibility = (options.visibility === undefined) ? 1 : options.visibility;
	this.color = options.color || COLOR;
};

Base.prototype.getRectangle = function() {
	return new Rectangle(this.position, this.size, this.direction);
};

Base.prototype.update = function(dt) {};

Base.prototype.draw = function(options) {
	var canvas = this.game.canvas;

	options = extend(this, options);
	if(options.visibility - Math.pow(10, -10) <= 0) return;
	if(options.size.width <= 0 || options.size.height <= 0) return;

	canvas.save();
	canvas.translate(options.position.x, options.position.y);
	canvas.rotate(options.direction);
	canvas.fillStyle = rgba(options.color, options.visibility);
	canvas.fillRect(-options.size.width / 2, -options.size.height / 2, options.size.width, options.size.height);
	canvas.restore();
};

Base.prototype.distanceTo = function(bodyOrPoint) {
	var point = bodyOrPoint.position ? bodyOrPoint.position : bodyOrPoint;
	return math.distance(point, this.position);
};

module.exports = Base;

},{"../math":24,"./rectangle":14,"util":7,"xtend":8}],10:[function(require,module,exports){
var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Base = require('./base');
var Rectangle = require('./rectangle');

var RADIUS = 3;
var SPEED = 0.8;
var HIT_TOLERANCE = Math.pow(10, -1);

var PARTICLE_COUNT = 10;
var MIN_PARTICLE_SIZE = 5;
var MAX_PARTICLE_SIZE = 10;
var MIN_PARTICLE_SPEED = 0.06;
var MAX_PARTICLE_SPEED = 0.2;
var MIN_PARTICLE_SCALE = 0.01;
var MAX_PARTICLE_SCALE = 0.04;
var MIN_PARTICLE_ANGLE = -0.1;
var MAX_PARTICLE_ANGLE = 0.1;

var rand = function(min, max) {
	return min + Math.random() * (max - min);
};

var explosion = function(game, position, color) {
	for(var i = 0; i < 2 * Math.PI; i += Math.round(2 * Math.PI / PARTICLE_COUNT)) {
		var size = rand(MIN_PARTICLE_SIZE, MAX_PARTICLE_SIZE);
		var scale = rand(MIN_PARTICLE_SCALE, MAX_PARTICLE_SCALE);
		var speed = rand(MIN_PARTICLE_SPEED, MAX_PARTICLE_SPEED);
		var direction = i + rand(MIN_PARTICLE_ANGLE, MAX_PARTICLE_ANGLE);

		var particle = new Particle(game, {
			position: { x: position.x, y: position.y },
			size: { width: size, height: size },
			direction: direction,
			color: color,
			scale: scale,
			speed: speed
		});

		game.addBody(particle);
	}
};

var Particle = function(game, options) {
	Base.call(this, game, options);

	this.active = true;
	this.collidable = false;

	this.speed = options.speed;
	this.scale = options.scale;
};

util.inherits(Particle, Base);

Particle.prototype.update = function(dt) {
	var next = math.translate(this.position, this.direction, this.speed * dt);

	this.position.x = next.x;
	this.position.y = next.y;

	this.size.width -= this.scale * dt;
	this.size.height -= this.scale * dt;

	if(!this.isVisible()) this.game.removeBody(this);
};

Particle.prototype.isVisible = function() {
	return this.size.width > 0 && this.size.height > 0;
};

var Bullet = function(game, player, hit, options) {
	this.game = game;
	this.player = player;
	this.hit = hit;

	var position = math.translate(player.position, player.direction, player.size.width / 2 + RADIUS + 1);

	options = extend({
		position: position,
		direction: player.direction,
		visibility: 1
	}, options);

	this.active = true;
	this.collidable = false;

	this.position = options.position;
	this.direction = options.direction;
	this.visibility = options.visibility;
};

Bullet.prototype.update = function(dt) {
	var d = math.distance(this.position, this.hit);

	if(d < HIT_TOLERANCE) {
		this.explode();
	} else {
		this.move(dt);
	}
};

Bullet.prototype.move = function(dt) {
	var next = math.translate(this.position, this.direction, SPEED * dt);
	var dp = math.distance(this.position, this.hit);
	var dn = math.distance(next, this.hit);

	if(dp < dn) next = this.hit;

	this.position.x = next.x;
	this.position.y = next.y;
};

Bullet.prototype.explode = function() {
	explosion(this.game, this.position);
	explosion(this.game, this.position, [255, 163, 18]);

	this.game.removeBody(this);
};

Bullet.prototype.draw = function(options) {
	var canvas = this.game.canvas;

	options = extend(this, options);

	canvas.save();
	canvas.beginPath();
	canvas.arc(this.position.x, this.position.y, RADIUS, 0, 2 * Math.PI);
	canvas.fillStyle = util.format('rgba(0, 0, 0, %s)', options.visibility);
	canvas.fill();
	canvas.restore();
};

Bullet.prototype.getRectangle = function() {
	return new Rectangle(this.position, { width: 2 * RADIUS, height: 2 * RADIUS }, this.direction);
};

Bullet.prototype.toJSON = function() {
	return {
		position: { x: this.position.x, y: this.position.y },
		direction: this.direction
	};
};

module.exports = Bullet;

},{"../math":24,"./base":9,"./rectangle":14,"util":7,"xtend":8}],11:[function(require,module,exports){
var util = require('util');

var math = require('../math');
var Base = require('./base');

var FOOT_SIZE = { width: 8, height: 5 };
var FOOT_SLANT = 0.2;
var FOOT_DECAY = 0.0001;
var STRIDE_LENGTH = 15;
var FOOT_LENGTH = 4;

var FootStep = function(game, options) {
	options = options || {};
	options.size = FOOT_SIZE;
	options.direction += (options.isLeft ? -1 : 1) * FOOT_SLANT;

	Base.call(this, game, options);

	this.active = true;
	this.collidable = false;

	this.decay = (options.decay === undefined) ? FOOT_DECAY : options.decay;
	this.isLeft = !!options.isLeft;
	this.isRight = !options.isLeft;
};

util.inherits(FootStep, Base);

FootStep.prototype.update = function(dt) {
	this.visibility -= this.decay * dt;
	if(!this.isVisible()) this.game.removeBody(this);
};

FootStep.prototype.isVisible = function() {
	return this.visibility > 0;
};

var FootTrack = function(game, player) {
	this.game = game;
	this.player = player;

	this.latestLeft = false;
	this.latestPosition = { x: player.position.x, y: player.position.y };
	this.latestDirection = player.direction;
};

FootTrack.prototype.update = function(dt) {
	if(math.distance(this.player.position, this.latestPosition) >= STRIDE_LENGTH) {
		var step;

		if(this.latestLeft) {
			step = math.translate(this.latestPosition, this.latestDirection + Math.PI / 2, FOOT_LENGTH);
		} else {
			step = math.translate(this.latestPosition, this.latestDirection - Math.PI / 2, FOOT_LENGTH);
		}

		step = new FootStep(this.game, {
			position: step,
			direction: this.latestDirection,
			isLeft: !this.latestLeft
		});

		this.game.addBody(step);

		this.latestLeft = !this.latestLeft;
		this.latestPosition = { x: this.player.position.x, y: this.player.position.y };
		this.latestDirection = this.player.direction;
	}
};

module.exports = FootTrack;

},{"../math":24,"./base":9,"util":7}],12:[function(require,module,exports){
var util = require('util');

var Player = require('./player');
var Bullet = require('./bullet');
var find = require('../utils/find');

var LocalPlayer = function(game, controller, options) {
	Player.call(this, game, options);

	this.inputs = [];
	this.pending = [];
	this.sequence = 0;

	this.controller = controller;
};

util.inherits(LocalPlayer, Player);

LocalPlayer.prototype.update = function(dt) {
	Player.prototype.update.call(this, dt);

	var input = this.controller.input;

	if(Object.keys(input).length) {
		this.processInput(input, dt);

		var sequence = this.sequence++;

		this.inputs.push({
			input: input,
			sequence: sequence,
			dt: dt
		});
		this.pending.push({
			input: input,
			sequence: sequence
		});

		if(this.hasShot()) {
			var hit = this.game.hitscan(this);
			var shoot = new Bullet(this.game, this, hit.position);

			this.pending[this.pending.length - 1].bullet = {
				shoot: shoot,
				hit: hit
			};

			this.game.addBullet(shoot);
		}
	}
};

LocalPlayer.prototype.drain = function() {
	var pending = this.pending;
	this.pending = [];

	return pending;
};

LocalPlayer.prototype.reconcile = function(update) {
	var self = this;
	var latest = find(this.inputs, { sequence: update.sequence });
	var index = this.inputs.indexOf(latest);

	this.inputs.splice(0, index + 1);

	this.position = update.position;
	this.direction = update.direction;

	this.inputs.forEach(function(i) {
		self.processInput(i.input, i.dt);
	});
};

module.exports = LocalPlayer;

},{"../utils/find":27,"./bullet":10,"./player":13,"util":7}],13:[function(require,module,exports){
var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Rectangle = require('./rectangle');
var Base = require('./base');
var FootTrack = require('./foot-track');

var SIZE = { width: 20, height: 20 };
var ROTATION_SPEED = Math.PI / 800;
var MOVING_SPEED = 0.1;
var LINE_OF_SIGHT = 90;
var LINE_OF_SIGHT_EDGE = 10;
var RELOAD_SPEED = 0.001;

var Player = function(game, options) {
	options = extend({
		size: SIZE,
		direction: 0,
		visibility: 1,
		speed: MOVING_SPEED,
		lineOfSight: LINE_OF_SIGHT,
		reloadSpeed: RELOAD_SPEED,
		ammunition: 1,
		active: false,
		collidable: true
	}, options);

	Base.call(this, game, options);

	this.active = options.active;
	this.collidable = options.collidable;

	this.id = options.id;
	this.speed = options.speed;
	this.lineOfSight = options.lineOfSight;
	this.reloadSpeed = options.reloadSpeed;
	this.ammunition = options.ammunition;

	this.footTrack = options.footTrack || new FootTrack(game, this);
};

util.inherits(Player, Base);

Player.prototype.update = function(dt) {
	this.footTrack.update(dt);
	if(this.ammunition < 1) this.ammunition += this.reloadSpeed * dt;
};

Player.prototype.processInput = function(input, dt) {
	var target = input.target;
	var position = this.position;

	var next = { x: position.x, y: position.y, direction: this.direction };

	if(target) {
		var d = math.direction({ x: target.x - position.x, y: target.y - position.y });

		next.direction = d.radians;
		next.x = position.x + d.x * this.speed * dt;
		next.y = position.y + d.y * this.speed * dt;
	} else {
		if(input.shoot && this.ammunition >= 1) {
			this.ammunition = 0;
		}
		if(input.left) {
			next.direction = this.direction - ROTATION_SPEED * dt;
		}
		if(input.right) {
			next.direction = this.direction + ROTATION_SPEED * dt;
		}
		if(input.up) {
			var t = math.translate(position, this.direction, this.speed * dt);
			next.x = t.x;
			next.y = t.y;
		}
		if(input.down) {
			var t = math.translate(position, this.direction + Math.PI, this.speed * dt);
			next.x = t.x;
			next.y = t.y;
		}
	}

	var bounds = new Rectangle(next, this.size, next.direction);

	if(!this.game.inBounds(bounds)) return;
	if(this.game.isColliding(bounds, [this])) return;

	this.position.x = next.x;
	this.position.y = next.y;
	this.direction = next.direction;
};

Player.prototype.hasShot = function() {
	return !this.ammunition;
};

Player.prototype.visibilityOf = function(pointOrBody) {
	var d = this.distanceTo(pointOrBody);
	var inner = this.lineOfSight - LINE_OF_SIGHT_EDGE;
	var outer = this.lineOfSight + LINE_OF_SIGHT_EDGE;

	if(d > outer) return 0;
	if(d < inner) return 1;
	return (1 - (d - inner) / (outer - inner));
};

Player.prototype.toJSON = function() {
	return {
		id: this.id,
		position: { x: this.position.x, y: this.position.y },
		size: { width: this.size.width, height: this.size.height },
		direction: this.direction,
		visibility: this.visibility,
		speed: this.speed,
		lineOfSight: this.lineOfSight,
		reloadSpeed: this.reloadSpeed,
		ammunition: this.ammunition
	};
};

module.exports = Player;

},{"../math":24,"./base":9,"./foot-track":11,"./rectangle":14,"util":7,"xtend":8}],14:[function(require,module,exports){
var math = require('../math');
var colliding = require('../colliding');
var intersections = require('../intersections');

var getPoints = function(position, size, direction) {
	var x = position.x;
	var y = position.y;

	var w = size.width / 2;
	var h = size.height / 2;

	return [
		{ x: x + w, y: y + h },
		{ x: x + w, y: y - h },
		{ x: x - w, y: y - h },
		{ x: x - w, y: y + h }
	].map(function(point) {
		return math.rotate(point, position, direction);
	});
};

var getBoundingRectangle = function(points) {
	var maxX, minX, maxY, minY;

	points.forEach(function(point) {
		if(maxX === undefined || point.x > maxX) maxX = point.x;
		if(minX === undefined || point.x < minX) minX = point.x;
		if(maxY === undefined || point.y > maxY) maxY = point.y;
		if(minY === undefined || point.y < minY) minY = point.y;
	});

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
};

var Rectangle = function(position, size, direction) {
	this.position = position;
	this.size = size;
	this.direction = direction;

	this.points = getPoints(position, size, direction);
	this.bounding = getBoundingRectangle(this.points);
};

Rectangle.aligned = function(position, size) {
	return new Rectangle({ x: position.x + size.width / 2, y: position.y + size.height / 2 }, size, 0);
};

Rectangle.prototype.getIntersections = function(point, direction) {
	if(typeof direction === 'number') {
		direction = { x: Math.cos(direction), y: Math.sin(direction) };
	}

	return intersections(point, direction, this.points);
};

Rectangle.prototype.isColliding = function(rectangle) {
	return colliding(this.points, rectangle.points);
};

Rectangle.prototype.isRectangleInside = function(rectangle) {
	var self = this;

	return rectangle.points.every(function(point) {
		return self.isPointInside(point);
	});
};

Rectangle.prototype.isPointInside = function(point) {
	point = math.rotate(point, this.position, 2 * Math.PI - this.direction);

	var x = this.position.x - this.size.width / 2;
	var y = this.position.y - this.size.height / 2;

	return (x <= point.x && point.x <= x + this.size.width) && (y <= point.y && point.y <= y + this.size.height);
};

module.exports = Rectangle;

},{"../colliding":16,"../intersections":19,"../math":24}],15:[function(require,module,exports){
var util = require('util');

var Player = require('./player');
var Bullet = require('./bullet');
var math = require('../math');

var UPDATES_SIZE = 60 * 2;

var noop = function() {};

var RemotePlayer = function(game, options) {
	Player.call(this, game, options);

	this.updates = [];
	this.bullets = [];
};

util.inherits(RemotePlayer, Player);

RemotePlayer.prototype.processInput = noop;

RemotePlayer.prototype.addUpdate = function(update) {
	this.updates.push(update);

	if(this.updates.length >= UPDATES_SIZE) {
		this.updates.shift();
	}
	if(update.bullet) {
		this.bullets.push(update.bullet);
	}
};

RemotePlayer.prototype.interpolate = function(time) {
	var updates = this._getUpdates(time);
	if(!updates) return;

	var next = updates.next;
	var previous = updates.previous;

	var diff = next.t - previous.t;
	var progress = diff ? (time - previous.t) / diff : 1;

	this.position = math.lerp(previous.position, next.position, progress);
	this.direction = (next.direction - previous.direction) * progress + next.direction;
	this._shoot(time);
};

RemotePlayer.prototype._getUpdates = function(time) {
	var updates = this.updates;

	for(var i = 0; i < updates.length - 1; i++) {
		if(updates[i].t < time && time < updates[i + 1].t) {
			return {
				next: updates[i + 1],
				previous: updates[i]
			};
		}
	}
};

RemotePlayer.prototype._shoot = function(time) {
	var options = this.bullets.shift();
	if(!options || options.hit.t > time) return;

	var hit = options.hit;
	var bullet = new Bullet(this.game, this, hit.position, options.shoot);

	bullet.move(time - hit.t);
	this.game.addBody(bullet);
};

module.exports = RemotePlayer;

},{"../math":24,"./bullet":10,"./player":13,"util":7}],16:[function(require,module,exports){
var subtract = function(p1, p2) {
	return { x: p1.x - p2.x, y: p1.y - p2.y };
};

var min = function(arr) {
	return Math.min.apply(null, arr);
};

var max = function(arr) {
	return Math.max.apply(null, arr);
};

var project = function(vector, target) {
	var x = target.x;
	var y = target.y;

	var s = dot(vector, target) / (x * x + y * y);

	return { x: s * x, y: s * y };
};

var dot = function(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
};

var projectRectangle = function(axis, points) {
	return points.map(function(point) {
		return project(point, axis);
	});
};

var isOverlaping = function(axis, p1, p2) {
	var scalar = function(v) {
		return dot(axis, v);
	};

	var sr1 = projectRectangle(axis, p1).map(scalar);
	var sr2 = projectRectangle(axis, p2).map(scalar);

	return min(sr2) <= max(sr1) && max(sr2) >= min(sr1);
};

module.exports = function(p1, p2) {
	return isOverlaping(subtract(p1[0], p1[1]), p1, p2) &&
		isOverlaping(subtract(p1[1], p1[2]), p1, p2) &&
		isOverlaping(subtract(p2[0], p2[1]), p1, p2) &&
		isOverlaping(subtract(p2[1], p2[2]), p1, p2);
};

},{}],17:[function(require,module,exports){
var extend = require('xtend');

var Rectangle = require('./bodies/rectangle');
var LocalPlayer = require('./bodies/local-player.client');
var RemotePlayer = require('./bodies/remote-player.client');
var Keyboard = require('./keyboard');
var Mouse = require('./mouse');

var math = require('./math');
var append = require('./utils/append');
var remove = require('./utils/remove');
var find = require('./utils/find');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var UPDATE_OFFSET = 100;
var EMIT_UPDATES_FREQUENCY = 45;
var INITIAL_POSITION = { x: 30, y: 30 };

var TIME_SYNC_RETRIES = 2;
var TIME_SYNC_FREQUENCY = 100;

var InputController = function(element) {
	this.keyboard = new Keyboard();
	this.mouse = new Mouse(element);
};

InputController.prototype.__defineGetter__('input', function() {
	return extend(this.keyboard.input, this.mouse.input);
});

var Game = function(element, options) {
	this._options = options || {};
	element = document.getElementById(element);

	this.element = element;
	this.canvas = element.getContext('2d');
	this.size = { width: element.width, height: element.height };
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);

	this.player = null;
	this.bodies = [];
	this.others = [];

	this._animation = null;
	this._update = null;
	this._emit = null;
	this._socket = null;
	this._time = { u: 0, v: 0 };

	this._add = [];
	this._remove = [];

	this.level = level(this);
};

Game.prototype.update = function(dt) {
	append(this.bodies, this._add);
	remove(this.bodies, this._remove);

	this._add = [];
	this._remove = [];

	this.bodies.forEach(function(body) {
		body.update(dt);
	});

	var time = this._time.v - UPDATE_OFFSET;

	this.others.forEach(function(other) {
		other.interpolate(time);
	});
};

Game.prototype.draw = function() {
	this.canvas.clearRect(0, 0, this.size.width, this.size.height);

	var self = this;

	this.bodies.forEach(function(body) {
		if(body.active && !self._options.debug) {
			var visibility = body.visibility * self.player.visibilityOf(body);
			if(visibility > 0) body.draw({ visibility: visibility });
		} else {
			body.draw();
		}
	});
};

Game.prototype.addBody = function(body) {
	if(this._update) this._add.push(body);
	else this.bodies.push(body);
};

Game.prototype.removeBody = function(body) {
	if(this._update) this._remove.push(body);
	else remove(this.bodies, body);
};

Game.prototype.addBullet = function(bullet) {
	this._socket.emit('update', this.player.drain());
	this.addBody(bullet);
};

Game.prototype.start = function() {
	var self = this;

	if(this._options.offline) {
		this._initializeLocal({
			self: { position: INITIAL_POSITION },
			others: [],
			t: Date.now()
		});
		this._drainUpdates();
	} else {
		this._socket = io({
			reconnection: false
		});
		this._socket.on('initialize', function(message) {
			self._synchronizeTime(function(t) {
				message.t = t;

				self._initializeLocal(message);
				self._initializeRemote();
			});
		});
	}
};

Game.prototype.stop = function() {
	cancelAnimationFrame(this._animation);
	clearInterval(this._update);
	clearInterval(this._emit);
	this._socket.close();

	this._animation = null;
	this._update = null;
	this._emit = null;
	this._socket = null;
};

Game.prototype.isColliding = function(rectangle, ignore) {
	return this.bodies.some(function(body) {
		if(ignore && ignore.indexOf(body) >= 0) return false;
		return body.collidable && rectangle.isColliding(body.getRectangle());
	});
};

Game.prototype.inBounds = function(rectangle) {
	return this.bounds.isRectangleInside(rectangle);
};

Game.prototype.hitscan = function(source) {
	var position = source.position;
	var direction = source.direction;

	var hit;
	var distance;
	var body;

	this.bodies.forEach(function(b) {
		if(b === source || !b.collidable) return;

		var rectangle = b.getRectangle();
		var intersections = rectangle.getIntersections(position, direction);

		if(!intersections.length) return;

		intersections.forEach(function(p) {
			var d = math.distance(position, p);

			if(distance === undefined || d < distance) {
				hit = p;
				distance = d;
				body = b;
			}
		});
	});

	if(!hit) hit = this.bounds.getIntersections(position, direction)[0];

	return {
		position: hit,
		body: body && body.id,
		t: this._time.v
	};
};

Game.prototype._initializeLocal = function(options) {
	var self = this;
	var lastTick = Date.now();

	this._time = { u: Date.now(), v: options.t };

	this._createPlayer(options.self);

	options.others.forEach(function(other) {
		self._addOther(other);
	});

	this._update = setInterval(function() {
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;

		self._time.v += (now - self._time.u);
		self._time.u = now;

		self.update(dt);
	}, UPDATE_FREQUENCY);

	this._animation = requestAnimationFrame(function tick() {
		self.draw();
		self._animation = requestAnimationFrame(tick);
	});
};

Game.prototype._initializeRemote = function() {
	var self = this;
	var socket = this._socket;

	socket.on('player_state', function(message) {
		var update = find(message.players, { id: self.player.id });
		if(update) self.player.reconcile(update);

		self.others.forEach(function(other) {
			var update = find(message.players, { id: other.id });

			if(update) {
				update.t = message.t;
				other.addUpdate(update);
			}
		});
	});
	socket.on('player_join', function(message) {
		self._addOther(message);
	});
	socket.on('player_leave', function(message) {
		var other = find(self.others, { id: message.id });

		if(other) {
			self.removeBody(other);
			remove(self.others, other);
		}
	});

	this._emit = setInterval(function() {
		var updates = self.player.drain();
		if(updates.length) socket.emit('update', updates);
	}, EMIT_UPDATES_FREQUENCY);
};

Game.prototype._createPlayer = function(options) {
	var controller = new InputController(this.element);
	this.player = new LocalPlayer(this, controller, options);

	this.addBody(this.player);
	this.level.fog.reveal(this.player);
};

Game.prototype._addOther = function(options) {
	options.active = true;

	var player = new RemotePlayer(this, options);

	this.addBody(player);
	this.others.push(player);
};

Game.prototype._drainUpdates = function() {
	var self = this;

	setInterval(function() {
		self.player.drain();
	}, UPDATE_FREQUENCY);
};

Game.prototype._synchronizeTime = function(callback) {
	var socket = this._socket;
	var times = TIME_SYNC_RETRIES;
	var l = Number.MAX_VALUE;
	var t = 0;

	var sync = function() {
		var now = Date.now();

		socket.once('pong', function(message) {
			var latency = (Date.now() - now) / 2;

			if(latency < l) {
				t = message.t;
				l = latency;
			}

			if(times--) setTimeout(sync, TIME_SYNC_FREQUENCY);
			else callback(Math.round(t - l));
		});

		socket.emit('ping');
	};

	sync();
};

module.exports = Game;

},{"./bodies/local-player.client":12,"./bodies/rectangle":14,"./bodies/remote-player.client":15,"./keyboard":20,"./levels/level-1":22,"./math":24,"./mouse":25,"./utils/append":26,"./utils/find":27,"./utils/remove":28,"xtend":8}],18:[function(require,module,exports){
var qs = require('querystring');
var Game = require('./game.client');

var options = qs.parse(window
		.location
		.search
		.replace(/^\?/, ''));

var game = new Game('canvas', options);
game.start();

window.game = game;

},{"./game.client":17,"querystring":5}],19:[function(require,module,exports){
var EPSILON = Math.pow(10, -5);

var equal = function(number, target) {
	return (target - EPSILON) < number && number < (target + EPSILON);
};

module.exports = function(point, direction, polygon) {
	var intersections = [];

	var x00 = point.x;
	var y00 = point.y;
	var x01 = direction.x;
	var y01 = direction.y;

	polygon.forEach(function(current, i) {
		var j = (i === polygon.length - 1) ? 0 : (i + 1);
		var next = polygon[j];

		var x10 = current.x;
		var y10 = current.y;
		var x11 = next.x - current.x;
		var y11 = next.y - current.y;

		var ux = x00 - x10;
		var uy = y00 - y10;

		if(equal(ux, 0) && equal(uy, 0)) {
			return intersections.push({ x: x00, y: y00 });
		}

		var det = x11 * y01 - x01 * y11;

		if(equal(det, 0)) {
			// Almost parallel
			return;
		}

		var inverse = 1 / det;
		var s = inverse * (ux * y01 - uy * x01);
		var t = inverse * (ux * y11 - uy * x11);

		var it = equal(t, 0) || t > 0;
		var is = (equal(s, 0) || s > 0) && (equal(s, 1) || s < 1);

		if(it && is) {
			intersections.push({ x: x00 + x01 * t, y: y00 + y01 * t });
		}
	});

	return intersections;
};

},{}],20:[function(require,module,exports){
var KEYS = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	32: 'space'
};

var ACTIONS = {
	left: 'left',
	up: 'up',
	right: 'right',
	down: 'down',
	space: 'shoot'
};

var action = function(key) {
	return ACTIONS[KEYS[key]];
};

var Keyboard = function() {
	var input = this.input = {};

	this._onkeydown = function(e) {
		var a = action(e.keyCode);
		if(a) input[a] = true;
	};
	this._onkeyup = function(e) {
		delete input[action(e.keyCode)];
	};

	window.addEventListener('keydown', this._onkeydown);
	window.addEventListener('keyup', this._onkeyup);
};

module.exports = Keyboard;

},{}],21:[function(require,module,exports){
var util = require('util');

var DENSITY = 0.1;
var EDGE_WIDTH = 20;

var fog = function() {
	return util.format('rgba(0, 0, 0, %s)', DENSITY);
};

var Fog = function(game) {
	this.game = game;
	this.revealed = [];

	this.active = false;
	this.collidable = false;
};

Fog.prototype.update = function(dt) {};

Fog.prototype.draw = function() {
	var canvas = this.game.canvas;
	var size = this.game.size;

	canvas.save();

	canvas.beginPath();
	canvas.moveTo(0, 0);
	canvas.lineTo(size.width, 0);
	canvas.lineTo(size.width, size.height);
	canvas.lineTo(0, size.height);
	canvas.lineTo(0, 0);

	this.revealed.forEach(function(body) {
		var position = body.position;
		var lineOfSight = body.lineOfSight;

		canvas.arc(position.x, position.y, lineOfSight, 0, 2 * Math.PI, true);

		canvas.fillStyle = fog();
		canvas.fill();

		var edge = canvas.createRadialGradient(position.x, position.y, lineOfSight - EDGE_WIDTH, position.x, position.y, lineOfSight);
		edge.addColorStop(0, 'rgba(255, 255, 255, 0)');
		edge.addColorStop(1, fog());

		canvas.arc(position.x, position.y, lineOfSight, 0, 2 * Math.PI);
		canvas.fillStyle = edge;
		canvas.fill();
	});

	canvas.restore();
};

Fog.prototype.reveal = function(body) {
	this.revealed.push(body);
};

module.exports = Fog;

},{"util":7}],22:[function(require,module,exports){
var wall = require('./wall');
var Fog = require('./fog');

module.exports = function(game) {
	var fog = new Fog(game);
	game.addBody(fog);

	var segment = wall(game, { x: 300, y: 100 }, [{ direction: 1.2, length: 50 }, { direction: 1, length: 50 }, { direction: 0.7, length: 50 }]);
	wall(game, { x: segment.x + 50, y: segment.y + 50 }, [{ direction: 1, length: 50 }, { direction: 1.3, length: 50 }]);

	return {
		fog: fog
	};
};

},{"./fog":21,"./wall":23}],23:[function(require,module,exports){
var util = require('util');

var math = require('../math');
var Base = require('../bodies/base');

var PILLAR_NORMAL_SIZE = { width: 13, height: 13 };
var PILLAR_MEDIUM_SIZE = { width: 15, height: 15 };
var WALL_WIDTH = 6;

var Wall = function() {
	Base.apply(this, arguments);

	this.active = false;
	this.collidable = true;
};

util.inherits(Wall, Base);

var wall = function(game, point, segments) {
	var points = [point];
	var current = point;

	segments.forEach(function(segment) {
		var wall = new Wall(game, {
			position: math.translate(current, segment.direction, segment.length / 2),
			size: { width: segment.length, height: WALL_WIDTH },
			direction: segment.direction
		});

		game.addBody(wall);
		current = math.translate(current, segment.direction, segment.length);
		points.push(current);
	});

	points.forEach(function(point, i) {
		var prev = points[i - 1] || point;
		var next = points[i + 1] || point;
		var end = !i || i === points.length - 1;

		prev = math.normalize({ x: prev.x - point.x, y: prev.y - point.y });
		next = math.normalize({ x: next.x - point.x, y: next.y - point.y });

		var d = math.direction({ x: next.x + prev.x, y: next.y + prev.y });
		var pillar = new Wall(game, {
			position: point,
			size: end ? PILLAR_MEDIUM_SIZE : PILLAR_NORMAL_SIZE,
			direction: d.radians
		});

		game.addBody(pillar);
	});

	return points[points.length - 1];
};

module.exports = wall;

},{"../bodies/base":9,"../math":24,"util":7}],24:[function(require,module,exports){
var lerp = function(v1, v2, t) {
	return v1 + t * (v2 - v1);
};

exports.translate = function(point, direction, length) {
	var x1 = Math.cos(direction) * length;
	var y1 = Math.sin(direction) * length;

	return {
		x: point.x + x1,
		y: point.y + y1
	};
};

exports.rotate = function(point, pivot, angle) {
	var x = point.x - pivot.x;
	var y = point.y - pivot.y;

	var cos = Math.cos(angle);
	var sin = Math.sin(angle);

	return {
		x: x * cos - y * sin + pivot.x,
		y: x * sin + y * cos + pivot.y
	};
};

exports.direction = function(vector) {
	var length = exports.length(vector);
	var radians = length ? Math.acos(vector.x / length) : 0;

	if(vector.y < 0) radians = -radians;

	var unit = exports.normalize(vector);
	unit.radians = radians;

	return unit;
};

exports.distance = function(p1, p2) {
	var x = p2.x - p1.x;
	var y = p2.y - p1.y;

	return Math.sqrt(x * x + y * y);
};

exports.length = function(vector) {
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
};

exports.normalize = function(vector) {
	var length = exports.length(vector);
	if(!length) return { x: 0, y: 0 };

	return {
		x: vector.x / length,
		y: vector.y / length
	};
};

exports.lerp = function(p1, p2, t) {
	return { x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) };
};

},{}],25:[function(require,module,exports){
var Mouse = function(element) {
	var local = {};
	var input = this.input = {};

	element.addEventListener('mousemove', function(e) {
		local.x = e.offsetX;
		local.y = e.offsetY;
	});
	element.addEventListener('mouseleave', function(e) {
		delete input.target;
	});
	element.addEventListener('mousedown', function(e) {
		input.target = local;
	});
	element.addEventListener('mouseup', function(e) {
		delete input.target;
	});
};

module.exports = Mouse;

},{}],26:[function(require,module,exports){
module.exports = function(arr, items) {
	if(!Array.isArray(items)) items = [items];

	items.forEach(function(item) {
		arr.push(item);
	});
};

},{}],27:[function(require,module,exports){
var find = function(arr, fn) {
	for(var i = 0; i < arr.length; i++) {
		var item = arr[i];
		if(fn(item, i, arr)) return item;
	}
};

module.exports = function(arr, obj) {
	if(typeof obj === 'function') return find(arr, obj);

	var keys = Object.keys(obj);
	var fn = function(item) {
		return keys.every(function(key) {
			return item[key] === obj[key];
		});
	};

	return find(arr, fn);
};

},{}],28:[function(require,module,exports){
var remove = function(arr, item) {
	var i = arr.indexOf(item);
	if(i >= 0) arr.splice(i, 1);
};

module.exports = function(arr, item) {
	if(Array.isArray(item)) {
		item.forEach(function(it) {
			remove(arr, it);
		});
	} else {
		remove(arr, item);
	}
};

},{}]},{},[18])