// can-promise has a crash in some versions of react native that dont have
// standard global objects
// https://github.com/soldair/node-qrcode/issues/157

export default function canPromise () {
  return typeof Promise === 'function' && Promise.prototype && Promise.prototype.then
}
