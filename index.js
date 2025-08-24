import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ReactQRCode({ value, size = 128, ...props }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size }).then((url) => {
      if (active) setDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) return null;
  return <img src={dataUrl} alt="qr code" {...props} />;
}
