import React, { useEffect, useRef } from 'react'
import { toCanvas } from './index.js'

export function QRCode ({ value, options = {}, ...props }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      toCanvas(canvasRef.current, value, options)
    }
  }, [value, options])

  return React.createElement('canvas', { ref: canvasRef, ...props })
}

export default QRCode
