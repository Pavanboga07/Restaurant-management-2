import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../shared/Card';

const QRCodeGenerator = () => {
  const [networkUrl, setNetworkUrl] = useState('');

  useEffect(() => {
    // Get the current URL and replace localhost with actual network IP if needed
    const currentUrl = window.location.origin;
    setNetworkUrl(currentUrl + '/customer');
  }, []);

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'restaurant-menu-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div 
      className='max-w-7xl mx-auto'
      style={{ padding: 'var(--space-lg) var(--space-md)' }}
    >
      <h2 
        className='font-bold text-white'
        style={{ 
          fontSize: 'var(--text-3xl)', 
          lineHeight: 'var(--leading-tight)',
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-lg)' 
        }}
      >
        QR Code Menu
      </h2>
      
      <div className='grid grid-cols-1 md:grid-cols-2' style={{ gap: 'var(--space-lg)' }}>
        <Card>
          <h3 className='text-xl font-semibold mb-4 text-white'>Customer Menu QR Code</h3>
          <p className='text-slate-400 mb-4'>
            Print this QR code and place it on tables. Customers can scan it to view the menu on their phones.
          </p>
          
          <div className='bg-warning-900/40 border-l-4 border-warning-500 p-4 mb-4 rounded'>
            <p className='text-sm font-semibold text-warning-300'>⚠️ Important Setup:</p>
            <ol className='text-sm text-warning-200 mt-2 space-y-1 list-decimal list-inside'>
              <li>Make sure your phone and computer are on the same WiFi</li>
              <li>Start frontend with: <code className='bg-slate-800 px-2 py-1 rounded'>npm run dev -- --host</code></li>
              <li>Access via network IP (shown in terminal)</li>
              <li>Then generate QR code</li>
            </ol>
          </div>

          {networkUrl && (
            <>
              <div className='flex justify-center mb-4 bg-white p-6 rounded border-2 border-slate-700'>
                <QRCodeSVG
                  id='qr-code'
                  value={networkUrl}
                  size={256}
                  level='H'
                  includeMargin={true}
                />
              </div>
              <button
                onClick={downloadQR}
                className='w-full px-4 py-2 gradient-primary text-white rounded hover:scale-105 transition shadow-primary-glow mb-2'
              >
                📥 Download QR Code
              </button>
              <div className='bg-success-900/40 p-3 rounded text-sm border border-success-700/50'>
                <p className='font-semibold text-success-300'>✓ QR Code URL:</p>
                <p className='text-success-200 break-all mt-1'>{networkUrl}</p>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h3 className='text-xl font-semibold mb-4 text-white'>Setup Instructions</h3>
          <div className='space-y-4 text-slate-300'>
            <div>
              <h4 className='font-semibold text-lg mb-2 text-primary-400'>🔧 Initial Setup:</h4>
              <ol className='list-decimal list-inside space-y-2 text-sm text-slate-300'>
                <li>Open PowerShell in frontend folder</li>
                <li>Run: <code className='bg-slate-800 px-2 py-1 rounded text-slate-200'>npm run dev -- --host</code></li>
                <li>Note the Network IP (e.g., 192.168.1.10:5173)</li>
                <li>Open that Network URL in your browser</li>
                <li>Generate and download QR code</li>
              </ol>
            </div>
            <div>
              <h4 className='font-semibold text-lg mb-2 text-success-400'>📱 For Customers:</h4>
              <ol className='list-decimal list-inside space-y-2 text-sm text-slate-300'>
                <li>Connect phone to same WiFi network</li>
                <li>Scan the QR code with phone camera</li>
                <li>Browse menu with images and prices</li>
                <li>Add items to cart and call waiter</li>
              </ol>
            </div>
            <div>
              <h4 className='font-semibold text-lg mb-2 text-secondary-400'>🖨️ For Restaurant:</h4>
              <ol className='list-decimal list-inside space-y-2 text-sm text-slate-300'>
                <li>Download the QR code image</li>
                <li>Print and laminate (recommended size: 10x10cm)</li>
                <li>Place one on each table</li>
                <li>Menu updates automatically!</li>
              </ol>
            </div>
            <div className='bg-primary-900/40 p-4 rounded border border-primary-700/50'>
              <p className='font-semibold text-primary-300'>💡 Pro Tip:</p>
              <p className='text-sm text-primary-200 mt-1'>
                For permanent deployment, use a hosting service like Vercel or Netlify 
                instead of localhost/local IP addresses.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
