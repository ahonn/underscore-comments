// Utility Functions
// 通用函数
// -----------------

// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
// previous owner. Returns a reference to the Underscore object.
// 返回 Underscore 的引用
_.noConflict = function() {
  root._ = previousUnderscore;
  return this;
};

// Keep the identity function around for default iteratees.
// 返回自身
_.identity = function(value) {
  return value;
};

// Predicate-generating functions. Often useful outside of Underscore.
_.constant = function(value) {
  return function() {
    return value;
  };
};

_.noop = function(){};

_.property = property;

// Generates a function for a given object that returns a given property.
// 返回获取对象的 property 的函数
_.propertyOf = function(obj) {
  return obj == null ? function(){} : function(key) {
    return obj[key];
  };
};

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
_.matcher = _.matches = function(attrs) {
  attrs = _.extendOwn({}, attrs);
  return function(obj) {
    return _.isMatch(obj, attrs);
  };
};

// Run a function **n** times.
// 调用指定函数 n 次
_.times = function(n, iteratee, context) {
  // n 参数值为 0 时，不执行
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
};

// Return a random integer between min and max (inclusive).
// 返回 max 与 min 之间的随机数
_.random = function(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
};

// A (possibly faster) way to get the current timestamp as an integer.
// `now` 函数。
// 获取当前时间戳
_.now = Date.now || function() {
  return new Date().getTime();
};

  // List of HTML entities for escaping.
  // 转义 HTML字符
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};
// 键值对换，与 escapeMap 相反
var unescapeMap = _.invert(escapeMap);

// Functions for escaping and unescaping strings to/from HTML interpolation.
var createEscaper = function(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped
  var source = '(?:' + _.keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};
_.escape = createEscaper(escapeMap);
_.unescape = createEscaper(unescapeMap);

// If the value of the named `property` is a function then invoke it with the
// `object` as context; otherwise, return it.
// 返回指定的 property 的结果，为函数时直接执行函数返回结果，不存在时指定默认值返回默认值，否则返回 undefined
_.result = function(object, property, fallback) {
  var value = object == null ? void 0 : object[property];
  if (value === void 0) {
    value = fallback;
  }
  return _.isFunction(value) ? value.call(object) : value;
};

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
// 生成唯一的整数 ID
var idCounter = 0;
_.uniqueId = function(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
};

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
// 模板设置，定义界定符
_.templateSettings = {
  evaluate    : /<%([\s\S]+?)%>/g,
  interpolate : /<%=([\s\S]+?)%>/g,
  escape      : /<%-([\s\S]+?)%>/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
// 需要转义的字符
var escapes = {
  "'":      "'",
  '\\':     '\\',
  '\r':     'r',
  '\n':     'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

var escapeChar = function(match) {
  return '\\' + escapes[match];
};

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
// JavaScript 微型模板
// oldSettings 只使用在向后兼容
_.template = function(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = _.defaults({}, settings, _.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  // 合并界定符匹配正则表达式
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    // 将匹配到的字符串前的字符串保存下来
    source += text.slice(index, offset).replace(escaper, escapeChar);
    index = offset + match.length;

    if (escape) {
      // html 转义
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      // 变量替换
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      // Js 脚本执行
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offest.
    return match;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  // 生成执行函数
  try {
    var render = new Function(settings.variable || 'obj', '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  // 预编译模板
  var template = function(data) {
    return render.call(this, data, _);
  };

  // Provide the compiled source as a convenience for precompilation.
  var argument = settings.variable || 'obj';
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
};

// Add a "chain" function. Start chaining a wrapped Underscore object.
// 封装对象，使其能够链式调用
_.chain = function(obj) {
  var instance = _(obj);
  instance._chain = true;
  return instance;
};