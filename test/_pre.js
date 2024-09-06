const qs = (selector) => document.querySelector(selector)
const qsa = (selector) => document.querySelectorAll(selector)
happen.at = function (what, x, y, props) {
  this.once(
    document.elementFromPoint(x, y),
    L.Util.extend(
      {
        type: what,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        which: 1,
        button: 0,
      },
      props || {}
    )
  )
}
happen.drag = (fromX, fromY, toX, toY, then, delay) => {
  happen.at('mousemove', fromX, fromY)
  happen.at('mousedown', fromX, fromY)
  const stepX = fromX < toX ? 1 : -1
  const stepY = fromY < toY ? 1 : -1
  const moveX = () => {
    if (fromX !== toX) {
      happen.at('mousemove', (fromX += stepX), fromY)
      window.setTimeout(moveX, 1)
    }
  }
  moveX()
  const moveY = () => {
    if (fromY != toY) {
      happen.at('mousemove', fromX, (fromY += stepY))
      window.setTimeout(moveY, 1)
    }
  }
  moveY()
  window.setTimeout(() => {
    happen.at('mouseup', toX, toY)
    happen.at('click', toX, toY)
    if (then) {
      then()
    }
  }, delay || 600)
}
happen.drawingClick = (x, y) => {
  happen.at('mousedown', x, y)
  happen.at('mouseup', x, y)
}
chai.Assertion.addMethod('nearLatLng', function (expected, delta) {
  delta = delta || 1e-4
  expect(this._obj.lat).to.be.within(expected.lat - delta, expected.lat + delta)
  expect(this._obj.lng).to.be.within(expected.lng - delta, expected.lng + delta)
  return this
})
