'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, ShieldCheck } from 'lucide-react';
import * as OTPAuth from 'otpauth';

export default function TwoFactorAuthGenerator() {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('000 000');
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Update the code and progress bar
  useEffect(() => {
    const updateToken = () => {
      if (!secret.trim()) {
        setCode('000 000');
        setTimeLeft(30);
        setError('');
        return;
      }

      try {
        // Remove spaces and make uppercase just in case
        const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
        
        // Generate token
        const totp = new OTPAuth.TOTP({
          issuer: 'ScreenGo',
          label: '2FA',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(cleanSecret)
        });
        const token = totp.generate();
        // Format token with a space in the middle for readability
        setCode(`${token.slice(0, 3)} ${token.slice(3)}`);
        setError('');
        
        // Calculate remaining time
        const epoch = Math.floor(Date.now() / 1000);
        const remaining = 30 - (epoch % 30);
        setTimeLeft(remaining);
      } catch (err) {
        setCode('--- ---');
        setError('Secret inválido. Verifica que sea Base32.');
        setTimeLeft(0);
      }
    };

    // Initial update
    updateToken();

    // Update every 100ms for smooth progress bar (optional) or every 1s
    const interval = setInterval(updateToken, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleCopy = async () => {
    if (code === '000 000' || code === '--- ---') return;
    
    try {
      await navigator.clipboard.writeText(code.replace(' ', ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-[500px] bg-[#121212] border border-[#222222] rounded-2xl p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 w-full">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#FF6600]" />
            <div className="font-extrabold tracking-tight text-2xl text-white">
              screen<span className="text-[#FF6600]">Go</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#888888] uppercase tracking-wider">Encrypted</span>
            <div className="w-2 h-2 bg-[#FF6600] rounded-full shadow-[0_0_10px_#FF6600]"></div>
          </div>
        </div>

        {/* Input Section */}
        <div className="text-left mb-[30px]">
          <label htmlFor="secret" className="text-[11px] uppercase tracking-[1.5px] text-[#888888] mb-2.5 block">
            2FA Secret Key
          </label>
          <input
            id="secret"
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Ingrese su clave secreta..."
            className="w-full bg-[#1a1a1a] border border-[#222222] rounded-lg px-4 py-3.5 text-white font-mono text-sm outline-none focus:border-[#FF6600] transition-colors"
            autoComplete="off"
            spellCheck="false"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Code Display Section */}
        <label className="text-[11px] uppercase tracking-[1.5px] text-[#888888] mb-2.5 block text-center">
          Código de verificación
        </label>
        <div className="bg-black rounded-xl py-[30px] mb-5 border border-[#1a1a1a] relative overflow-hidden flex justify-center">
          <div className="font-mono text-5xl sm:text-6xl font-bold tracking-[8px] text-[#FF6600] drop-shadow-[0_0_20px_rgba(255,102,0,0.2)] transition-all duration-300">
            {code}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1a1a1a]">
            <div 
              className="h-full bg-[#FF6600] shadow-[0_0_10px_#FF6600] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleCopy}
          disabled={code === '000 000' || code === '--- ---'}
          className="bg-[#FF6600] text-black border-none rounded-lg py-4 w-full font-bold text-sm uppercase tracking-[1px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copiar Código</span>
            </>
          )}
        </button>

        {/* Footer Info */}
        <div className="mt-[30px] text-xs text-[#888888]">
          El código cambia en <span className="text-white">{timeLeft} segundos</span>
        </div>

        <div className="inline-block px-2 py-1 bg-[#1a1a1a] rounded mt-5 text-[10px] text-[#888888] border border-[#222222]">
          Generador Online
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-[#888888] text-xs flex gap-6 justify-center">
        <a href="https://wa.me/573232822796?text=Quiero%20informaci%C3%B3n%20de%20como%20activar%20Gemini%20pro." target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600] transition-colors">Soporte 24/7</a>
        <a href="https://screengo.uk" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600] transition-colors">Catálogo</a>
        <a href="https://www.facebook.com/ScreenGoApp" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6600] transition-colors">Nosotros</a>
      </div>
    </div>
  );
}
