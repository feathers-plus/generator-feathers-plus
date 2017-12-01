
// https://davidwalsh.name/detect-native-function
// https://gist.github.com/jdalton/5e34d890105aca44399f

/*
From the lodash docs on _.isNative:
 Note: This method can't reliably detect native functions in the presence of the core-js package
 because core-js circumvents this kind of detection. Despite multiple requests,
 the core-js maintainer has made it clear: any attempt to fix the detection will be obstructed.
 As a result, we're left with little choice but to throw an error. Unfortunately,
 this also affects packages, like babel-polyfill, which rely on core-js.
 */

// Used to resolve the internal `[[Class]]` of values
var toString = Object.prototype.toString;

// Used to resolve the decompiled source of functions
var fnToString = Function.prototype.toString;

// Used to detect host constructors (Safari > 4; really typed array specific)
var reHostCtor = /^\[object .+?Constructor\]$/;

// Compile a regexp using a common native method as a template.
// We chose `Object#toString` because there's a good chance it is not being mucked with.
var reNative = RegExp('^' +
  // Coerce `Object#toString` to a string
  String(toString)
  // Escape any special regexp characters
    .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
    // Replace mentions of `toString` with `.*?` to keep the template generic.
    // Replace thing like `for ...` to support environments like Rhino which add extra info
    // such as method arity.
    .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

function isNative(value) {
  var type = typeof value;
 
  return type == 'function'
    // Use `Function#toString` to bypass the value's own `toString` method
    // and avoid being faked out.
    ? reNative.test(fnToString.call(value))
    // Fallback to a host object check because some environments will represent
    // things like typed arrays as DOM methods which may not conform to the
    // normal native pattern.
    : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
}

// export however you want
module.exports = isNative;
