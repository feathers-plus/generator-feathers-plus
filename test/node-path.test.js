
const { assert } = require('chai');
const { delimiter, join, normalize, parse, posix, resolve, win32 } = require('path');
const { platform } = require('os');

const sepOk = delimiter;
const sepBad = delimiter === '\\' ? '/' : '\\';
const posixWin32 = platform() === 'win32' ? win32 : posix;

describe('node-path.test', () => {
  it('path.join does not change path sep chars', () => {
    const src = `a${sepOk}b${sepBad}c.js`;
    const res = join(src);

    assert.equal(res, src);
  });

  it('path.[posix || win32].join does not change path sep chars', () => {
    const src = `a${sepOk}b${sepBad}c.js`;
    const res = posixWin32.join(src);

    assert.equal(res, `a${sepOk}b${sepBad}c.js`);
  });

  it('normalize does not change path sep chars', () => {
    const src = `a${sepOk}b${sepBad}c.js`
    const res = normalize(src);

    assert.equal(res, src);
  });

  it('parse does not change path sep chars', () => {
    const src = `a${sepOk}b${sepBad}c.js`;

    const parsed = parse(src);
    const res = posixWin32.join(parsed.dir, parsed.base);

    assert.equal(res, `a${sepOk}b${sepBad}c.js`);
  });

  it('split().join() changes path sep chars', () => {
    const src = `a${sepOk}b${sepBad}c.js`;

    const res = src.split(sepBad).join(sepOk);

    assert.equal(res, `a${sepOk}b${sepOk}c.js`);
  });
});