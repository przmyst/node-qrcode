import * as Utils from './utils.js'

function clearCanvas (ctx, canvas, size) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (!canvas.style) canvas.style = {}
  canvas.height = size
  canvas.width = size
  canvas.style.height = size + 'px'
  canvas.style.width = size + 'px'
}

function getCanvasElement () {
  try {
    return document.createElement('canvas')
  } catch (e) {
    throw new Error('You need to specify a canvas element')
  }
}

function rgbaStr (rgba) {
  const alpha = rgba.a / 255
  return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + alpha + ')'
}

function createGradient (ctx, size, opts) {
  const type = opts.type || 'linear'
  const colorStops = opts.colorStops || []
  let gradient
  if (type === 'radial') {
    const r = size / 2
    gradient = ctx.createRadialGradient(r, r, 0, r, r, r)
  } else {
    const angle = (opts.rotation || 0) * Math.PI / 180
    const x0 = size / 2 + Math.cos(angle + Math.PI) * size / 2
    const y0 = size / 2 + Math.sin(angle + Math.PI) * size / 2
    const x1 = size / 2 + Math.cos(angle) * size / 2
    const y1 = size / 2 + Math.sin(angle) * size / 2
    gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  }

  colorStops.forEach(function (c) {
    gradient.addColorStop(c.offset, c.color)
  })

  return gradient
}

export function render (qrData, canvas, options) {
  let opts = options
  let canvasEl = canvas

  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    opts = canvas
    canvas = undefined
  }

  if (!canvas) {
    canvasEl = getCanvasElement()
  }

  opts = Utils.getOptions(opts)
  const qrSize = qrData.modules.size
  const size = Utils.getImageWidth(qrSize, opts)
  const scale = Utils.getScale(qrSize, opts)

  const ctx = canvasEl.getContext('2d')
  clearCanvas(ctx, canvasEl, size)

  if (opts.gradient) {
    const data = qrData.modules.data
    ctx.fillStyle = rgbaStr(opts.color.light)
    ctx.fillRect(0, 0, size, size)

    const grad = createGradient(ctx, size, opts.gradient)
    ctx.fillStyle = grad
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (data[r * qrSize + c]) {
          ctx.fillRect((opts.margin + c) * scale, (opts.margin + r) * scale, scale, scale)
        }
      }
    }
  } else {
    const image = ctx.createImageData(size, size)
    Utils.qrToImageData(image.data, qrData, opts)
    ctx.putImageData(image, 0, 0)
  }

  if (opts.image) {
    const img = opts.image
    const w = opts.imageWidth || opts.imageSize || img.width || size * 0.2
    const h = opts.imageHeight || opts.imageSize || img.height || size * 0.2
    const dx = (size - w) / 2
    const dy = (size - h) / 2
    try {
      ctx.drawImage(img, dx, dy, w, h)
    } catch (e) {
      // ignore errors if image cannot be drawn
    }
  }

  return canvasEl
}

export function renderToDataURL (qrData, canvas, options) {
  let opts = options

  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    opts = canvas
    canvas = undefined
  }

  if (!opts) opts = {}

  const canvasEl = render(qrData, canvas, opts)

  const type = opts.type || 'image/png'
  const rendererOpts = opts.rendererOpts || {}

  return canvasEl.toDataURL(type, rendererOpts.quality)
}
