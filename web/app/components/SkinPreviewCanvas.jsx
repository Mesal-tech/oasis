'use client';

import React, { useEffect, useRef } from 'react';

const SkinPreviewCanvas = ({ gameType, skin, width = 600, height = 400 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !skin) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size (accounting for DPR)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Normalize coordinates
    ctx.scale(dpr, dpr);

    let frame = 0;

    // Slither Constants
    const segmentCount = 20; // Longer snake for nice wave
    const segmentRadius = 15;
    const snakeSpeed = 0.05;
    const waveAmplitude = 10;
    const waveFrequency = 0.3;

    // Flappy Bird Constants
    const birdSize = 40;
    const birdSpeed = 0.05;

    // Load Skin Image
    const img = new Image();
    img.src = skin.img;
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // --- BACKGROUND RENDER ---
      if (gameType === 'flappy-bird') {
        // Sky Blue Background with Clouds
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#4ec0ca');
        gradient.addColorStop(1, '#83e6ef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Simple Clouds moving
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudX = (frame * 0.5) % (width + 100) - 50;
        ctx.beginPath();
        ctx.arc(cloudX, 100, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 40, 100, 40, 0, Math.PI * 2);
        ctx.arc(cloudX + 80, 100, 30, 0, Math.PI * 2);
        ctx.fill();

        // Ground
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, height - 50, width, 50);
        ctx.fillStyle = '#73bf2e'; // Grass top
        ctx.fillRect(0, height - 50, width, 5); // Corrected Y to match original logic but fixed visual

      } else {
        // Default / Slither: Dark Grid
        ctx.fillStyle = '#161c22';
        ctx.fillRect(0, 0, width, height);

        // Grid Lines
        ctx.strokeStyle = '#232d36';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const offsetX = (frame * 1) % gridSize;
        const offsetY = (frame * 1) % gridSize;

        ctx.beginPath();
        for (let x = -offsetX; x <= width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = -offsetY; y <= height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      // --- CHARACTER RENDER ---
      const centerX = width / 2;
      const centerY = height / 2;

      if (gameType === 'flappy-bird') {
        const bobY = Math.sin(frame * birdSpeed) * 10;

        ctx.save();
        ctx.translate(centerX, centerY + bobY);

        // Draw Bird Body using Skin
        if (imgLoaded) {
          ctx.drawImage(img, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
        } else {
          // Fallback
          ctx.fillStyle = '#fdb142';
          ctx.beginPath();
          ctx.arc(0, 0, birdSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Wing (Simple Animation)
        if (Math.floor(frame / 10) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath();
          ctx.ellipse(-5, 5, 12, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath();
          ctx.ellipse(-5, 0, 12, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eye (Generic)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(8, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(10, -8, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

      } else {
        // Slither Snake Render
        // Draw from tail to head
        for (let i = segmentCount - 1; i >= 0; i--) {
          const t = i / 5; // spacing factor
          const waveY = Math.sin(frame * snakeSpeed + t * waveFrequency) * waveAmplitude;

          const x = centerX - (i * (segmentRadius * 1.2)); // Spacing segments behind head
          const y = centerY + waveY;

          // Shadow
          ctx.beginPath();
          ctx.arc(x + 2, y + 2, segmentRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fill();

          // Body Segment
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, segmentRadius, 0, Math.PI * 2);
          ctx.clip();

          if (imgLoaded) {
            ctx.drawImage(img, x - segmentRadius, y - segmentRadius, segmentRadius * 2, segmentRadius * 2);
          } else {
            ctx.fillStyle = skin.color || '#00ff88';
            ctx.fill();
          }

          // 3D Highlight
          const grad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, segmentRadius);
          grad.addColorStop(0, 'rgba(255,255,255,0.3)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.restore();

          // Outline
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, segmentRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Head Eyes
        const headX = centerX;
        const headY = centerY + Math.sin(frame * snakeSpeed) * waveAmplitude;

        const eyeOffset = 6;
        const eyeSize = 4;

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(headX + 5, headY - eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.arc(headX + 5, headY + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(headX + 7, headY - eyeOffset, eyeSize / 2, 0, Math.PI * 2);
        ctx.arc(headX + 7, headY + eyeOffset, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameType, skin, width, height]);

  return <canvas ref={canvasRef} className="rounded-xl shadow-2xl border-4 border-[#27272A]" />;
};

export default SkinPreviewCanvas;
