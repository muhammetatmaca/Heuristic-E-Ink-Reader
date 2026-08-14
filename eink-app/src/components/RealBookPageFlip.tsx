import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';
import { DECKLE_TEXTURE_BASE64 } from '../constants/deckleTextureBase64';

interface RealBookPageFlipProps {
  currentPageText: string;
  nextPageText: string;
  prevPageText: string;
  chapterTitle: string;
  currentPageIndex: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onTapCenter: () => void;
}

export const RealBookPageFlip: React.FC<RealBookPageFlipProps> = ({
  currentPageText,
  nextPageText,
  prevPageText,
  chapterTitle,
  currentPageIndex,
  onNextPage,
  onPrevPage,
  onTapCenter,
}) => {
  const webViewRef = useRef<WebView>(null);
  const { eink, typography } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  // Authentic Vintage Book Paper Tone from Photo (#EFE6D2)
  const paperBgColor =
    eink.paperType === 'book_parchment' ? '#EFE6D2' :
    eink.paperType === 'deckle_rough'   ? '#ECE3CE' :
    eink.paperType === 'japanese_washi' ? '#FAF5E8' :
    eink.paperType === 'kraft_recycled' ? '#E6DCBF' :
    eink.paperType === 'cotton_rag'     ? '#F5EFE0' :
    eink.paperType === 'newsprint'      ? '#EAE6DB' :
    theme.background;

  const effectiveBg = theme.isDark ? theme.background : paperBgColor;
  // Deep Physical Letterpress Ink from Photo (#1C1916)
  const textColor = theme.isDark ? theme.text : '#1C1916';
  const fw = eink.inkWeight === 'bold_press' ? '600' : eink.inkWeight === 'light' ? '400' : '500';
  const fs = typography.fontSize;
  const lh = typography.lineHeightRatio;
  const ls = typography.letterSpacing;
  const hm = typography.horizontalMargin;
  const ps = typography.paragraphSpacing;

  const pageData = {
    currentText: currentPageText || '',
    nextText: nextPageText || '',
    prevText: prevPageText || '',
    chapterTitle: chapterTitle || '',
    isFirstPage: currentPageIndex === 0,
    hasPrevPage: currentPageIndex > 0,
    bgColor: effectiveBg,
    textColor: textColor,
    fontSize: fs,
    lineHeightRatio: lh,
    letterSpacing: ls,
    fontWeight: fw,
    horizontalMargin: hm,
    paragraphSpacing: ps,
    isDark: theme.isDark,
    paperType: eink.paperType,
    paperTextureIntensity: eink.paperTextureIntensity,
    deckleEdgeRoughness: eink.deckleEdgeRoughness,
    fontFamily: typography.fontFamily,
  };

  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.updatePageContent) {
          window.updatePageContent(${JSON.stringify(pageData)});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [
    currentPageText,
    nextPageText,
    prevPageText,
    chapterTitle,
    currentPageIndex,
    effectiveBg,
    textColor,
    fs,
    lh,
    hm,
    fw,
    eink.paperType,
    eink.paperTextureIntensity,
    eink.deckleEdgeRoughness,
    typography.fontFamily,
  ]);

  const initialDataJson = JSON.stringify(pageData);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: ${effectiveBg};
}
#screen-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#canvas3d {
  width: 100%;
  height: 100%;
  display: block;
}
/* Physical Kindle Inset Screen Bezel Shadow */
#bezel-shadow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 5px 14px rgba(0, 0, 0, 0.26),
              inset 6px 0 16px rgba(0, 0, 0, 0.32),
              inset -5px 0 14px rgba(0, 0, 0, 0.22),
              inset 0 -5px 14px rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(0, 0, 0, 0.16);
  z-index: 10;
}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<div id="screen-container">
  <canvas id="canvas3d"></canvas>
  <div id="bezel-shadow-overlay"></div>
</div>

<script>
let currentData = ${initialDataJson};
const canvas3d = document.getElementById('canvas3d');

// Load authentic deckle paper texture image
const paperImage = new Image();
let isImageReady = false;
paperImage.onload = function() {
  isImageReady = true;
  if (window.refreshAllCanvases) {
    window.refreshAllCanvases();
  }
};
paperImage.src = "${DECKLE_TEXTURE_BASE64}";

// Refresh canvases when Google Book Fonts are fully loaded
if (document.fonts) {
  document.fonts.ready.then(function() {
    if (window.refreshAllCanvases) {
      window.refreshAllCanvases();
    }
  });
}

function rn(type) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type }));
  }
}

// Multi-Pass Letterpress Ink Squeeze & Capillary Bleed Renderer
function renderLetterpressWord(ctx, text, x, y, dpr, isDark, textColor) {
  // Pass 1: Capillary Ink Bleed (Soft microscopic fiber spreading)
  ctx.lineWidth = 0.7 * dpr;
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(38, 28, 18, 0.20)';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.strokeText(text, x, y);

  // Pass 2: Letterpress Emboss Impression & Squash Edge
  ctx.shadowColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(25, 18, 12, 0.36)';
  ctx.shadowBlur = 0.55 * dpr;
  ctx.shadowOffsetX = 0.15 * dpr;
  ctx.shadowOffsetY = 0.25 * dpr;

  // Pass 3: Deep Carbon Ink Core Body
  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);

  // Reset shadow
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
}

// 1. Solid Opaque Paper Canvas with Kindle Inset Bezel Shadow & Letterpress Ink Emulation
function drawTextToCanvas(cv, text, title, isFirst, data) {
  const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
  const w = window.innerWidth * dpr;
  const h = window.innerHeight * dpr;
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');

  if (data.isDark) {
    ctx.fillStyle = data.bgColor;
    ctx.fillRect(0, 0, w, h);
  } else {
    // 1. Base Warm Physical Paper
    ctx.fillStyle = data.bgColor;
    ctx.fillRect(0, 0, w, h);

    // 2. Texture Overlay if Available
    if (isImageReady && paperImage.naturalWidth > 0 && data.paperType !== 'smooth_vellum') {
      ctx.globalAlpha = 0.65;
      ctx.drawImage(paperImage, 0, 0, w, h);
      ctx.globalAlpha = 1.0;
    }

    // 3. Authentic Pulp Specks & Paper Tooth Grain
    if (data.paperTextureIntensity > 0) {
      ctx.fillStyle = 'rgba(60, 42, 22, 0.08)';
      for (let i = 0; i < 900; i++) {
        const px = Math.random() * w;
        const py = Math.random() * h;
        const sz = 1.0 + Math.random() * 1.8;
        ctx.fillRect(px, py, sz, sz);
      }
      ctx.fillStyle = 'rgba(80, 60, 35, 0.035)';
      for (let i = 0; i < 4000; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.1, 1.1);
      }
    }
  }

  // 4. Physical Kindle Bezel Inset Shadow (Top, Bottom, Left, Right Chassis Depth)
  // Left Spine & Bezel Gutter Shadow
  const spineGrad = ctx.createLinearGradient(0, 0, 34 * dpr, 0);
  spineGrad.addColorStop(0, data.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(32, 20, 10, 0.38)');
  spineGrad.addColorStop(0.35, data.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(32, 20, 10, 0.16)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 34 * dpr, h);

  // Top Bezel Drop Shadow
  const topGrad = ctx.createLinearGradient(0, 0, 0, 16 * dpr);
  topGrad.addColorStop(0, data.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(25, 18, 10, 0.28)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 16 * dpr);

  // Right Bezel Shadow
  const rightGrad = ctx.createLinearGradient(w, 0, w - 18 * dpr, 0);
  rightGrad.addColorStop(0, data.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(25, 18, 10, 0.22)');
  rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(w - 18 * dpr, 0, 18 * dpr, h);

  // Bottom Bezel Shadow
  const bottomGrad = ctx.createLinearGradient(0, h, 0, h - 16 * dpr);
  bottomGrad.addColorStop(0, data.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(25, 18, 10, 0.24)');
  bottomGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, h - 16 * dpr, w, 16 * dpr);

  const scaledFs = data.fontSize * dpr;
  const lineH = scaledFs * data.lineHeightRatio;
  const marginX = data.horizontalMargin * dpr;
  const maxWidth = w - (marginX * 2);
  let cursorY = 54 * dpr;

  // Authentic classical book font stack
  const bookFontFamily = '"EB Garamond", "Literata", "Lora", Georgia, "Times New Roman", serif';

  // Chapter Monumental Title
  if (isFirst && title) {
    ctx.font = 'bold ' + Math.round(scaledFs * 1.35) + 'px ' + bookFontFamily;
    renderLetterpressWord(ctx, title, marginX, cursorY, dpr, data.isDark, data.textColor);
    cursorY += (scaledFs * 1.35) + (data.paragraphSpacing * dpr * 1.25);
  }

  const regularFont = data.fontWeight + ' ' + Math.round(scaledFs) + 'px ' + bookFontFamily;
  ctx.font = regularFont;

  const paragraphs = (text || '').split('\\n\\n');

  paragraphs.forEach((paragraph, pIdx) => {
    if (!paragraph.trim()) return;

    let words = paragraph.trim().split(/\\s+/);
    if (words.length === 0) return;

    // Drop Cap on Chapter Opening
    let startX = marginX;
    let currentAvailWidth = maxWidth;
    let dropCapDrawn = false;

    if (isFirst && pIdx === 0 && words[0].length > 0) {
      const firstChar = words[0].charAt(0);
      words[0] = words[0].substring(1);

      const dropCapSize = Math.round(lineH * 1.95);
      ctx.font = 'bold ' + dropCapSize + 'px ' + bookFontFamily;
      const dcMetrics = ctx.measureText(firstChar);
      const dcWidth = dcMetrics.width + (10 * dpr);
      const dcTop = cursorY;

      renderLetterpressWord(ctx, firstChar, marginX, dcTop + (scaledFs * 0.85), dpr, data.isDark, data.textColor);
      startX = marginX + dcWidth;
      currentAvailWidth = maxWidth - dcWidth;
      dropCapDrawn = true;
      ctx.font = regularFont;
    } else {
      // Paragraph First-Line Indent (1.4em)
      const indent = scaledFs * 1.4;
      startX = marginX + indent;
      currentAvailWidth = maxWidth - indent;
    }

    // Precise Line Wrapping & Justification with Letterpress Multi-Pass
    let currentLineWords = [];
    let currentLineW = 0;
    let isFirstLineOfP = true;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word) continue;

      const wordW = ctx.measureText(word).width;
      const spaceW = ctx.measureText(' ').width;

      if (currentLineWords.length === 0 || currentLineW + wordW <= currentAvailWidth) {
        currentLineWords.push({ text: word, width: wordW });
        currentLineW += wordW + spaceW;
      } else {
        renderJustifiedLine(ctx, currentLineWords, startX, cursorY, currentAvailWidth, false, dpr, data.isDark, data.textColor);
        cursorY += lineH;

        isFirstLineOfP = false;
        startX = marginX;
        currentAvailWidth = maxWidth;

        currentLineWords = [{ text: word, width: wordW }];
        currentLineW = wordW + spaceW;
      }
    }

    if (currentLineWords.length > 0) {
      renderJustifiedLine(ctx, currentLineWords, startX, cursorY, currentAvailWidth, true, dpr, data.isDark, data.textColor);
      cursorY += lineH + (data.paragraphSpacing * dpr);
    }
  });
}

// Helper: Justified Text Renderer with Letterpress Ink Bleed
function renderJustifiedLine(ctx, words, startX, y, targetWidth, isLastLine, dpr, isDark, textColor) {
  if (words.length === 0) return;

  if (isLastLine || words.length === 1) {
    let x = startX;
    const spaceW = ctx.measureText(' ').width;
    for (let i = 0; i < words.length; i++) {
      renderLetterpressWord(ctx, words[i].text, x, y, dpr, isDark, textColor);
      x += words[i].width + spaceW;
    }
  } else {
    const totalWordsW = words.reduce((acc, w) => acc + w.width, 0);
    const spacePerGap = Math.max(ctx.measureText(' ').width * 0.75, (targetWidth - totalWordsW) / (words.length - 1));

    let x = startX;
    for (let i = 0; i < words.length; i++) {
      if (i === words.length - 1) {
        const exactLastX = startX + targetWidth - words[i].width;
        renderLetterpressWord(ctx, words[i].text, exactLastX, y, dpr, isDark, textColor);
      } else {
        renderLetterpressWord(ctx, words[i].text, x, y, dpr, isDark, textColor);
        x += words[i].width + spacePerGap;
      }
    }
  }
}

// 2. Three.js Scene Setup (Solid Opaque Paper Pages)
const scene = new THREE.Scene();
scene.background = new THREE.Color(currentData.bgColor);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.2;

const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2));

const ambLight = new THREE.AmbientLight(0xffffff, 0.95);
scene.add(ambLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.35);
dirLight.position.set(-2, 2, 4);
scene.add(dirLight);

const vFOV = (camera.fov * Math.PI) / 180;
const height3D = 2 * Math.tan(vFOV / 2) * camera.position.z;
const width3D = height3D * (window.innerWidth / window.innerHeight);

// Canvases
const currentCv = document.createElement('canvas');
const nextCv = document.createElement('canvas');
const prevCv = document.createElement('canvas');

drawTextToCanvas(currentCv, currentData.currentText, currentData.chapterTitle, currentData.isFirstPage, currentData);
drawTextToCanvas(nextCv, currentData.nextText, '', false, currentData);
drawTextToCanvas(prevCv, currentData.prevText, '', false, currentData);

const currentTex = new THREE.CanvasTexture(currentCv);
const nextTex = new THREE.CanvasTexture(nextCv);
const prevTex = new THREE.CanvasTexture(prevCv);
currentTex.minFilter = THREE.LinearFilter;
nextTex.minFilter = THREE.LinearFilter;
prevTex.minFilter = THREE.LinearFilter;

// Underlying Page (Opaque beneath)
const underMat = new THREE.MeshBasicMaterial({ map: nextTex, side: THREE.DoubleSide });
const underGeom = new THREE.PlaneGeometry(width3D, height3D, 2, 2);
const underMesh = new THREE.Mesh(underGeom, underMat);
underMesh.position.z = -0.01;
scene.add(underMesh);

// 3D Curled Turning Page Mesh (Solid Opaque Paper)
const turnGeom = new THREE.PlaneGeometry(width3D, height3D, 40, 40);
const origPositions = turnGeom.attributes.position.clone();
const turnMat = new THREE.MeshStandardMaterial({
  map: currentTex,
  side: THREE.DoubleSide,
  roughness: 0.9,
  metalness: 0.02,
});
const turnMesh = new THREE.Mesh(turnGeom, turnMat);
scene.add(turnMesh);

// Drop Shadow on underlying page during curl
const shadowMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
});
const shadowGeom = new THREE.PlaneGeometry(width3D, height3D, 2, 2);
const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
shadowMesh.position.z = -0.005;
scene.add(shadowMesh);

let curlFactor = 0;
let curlDirection = 'forward';
let isAnimating = false;
let animStart = 0;
let animDuration = 420;
let animFrom = 0;
let animTo = 0;
let animCallback = null;

function applyCurl(progress, direction) {
  const pos = turnGeom.attributes.position;
  const orig = origPositions;
  const count = pos.count;
  const halfW = width3D / 2;

  if (direction === 'forward') {
    const curlX = halfW - (progress * width3D * 1.35);
    const radius = 0.45;

    for (let i = 0; i < count; i++) {
      const ox = orig.getX(i);
      const oy = orig.getY(i);
      const oz = orig.getZ(i);

      if (ox > curlX) {
        const dist = ox - curlX;
        const angle = dist / radius;
        pos.setXYZ(
          i,
          curlX + radius * Math.sin(angle),
          oy + (dist * 0.08 * (oy / height3D)),
          oz + radius * (1 - Math.cos(angle)) * (1.0 - progress * 0.3)
        );
      } else {
        pos.setXYZ(i, ox, oy, oz);
      }
    }
    shadowMat.opacity = Math.sin(progress * Math.PI) * 0.32;
  } else {
    const curlX = -halfW + (progress * width3D * 1.35);
    const radius = 0.45;

    for (let i = 0; i < count; i++) {
      const ox = orig.getX(i);
      const oy = orig.getY(i);
      const oz = orig.getZ(i);

      if (ox < curlX) {
        const dist = curlX - ox;
        const angle = dist / radius;
        pos.setXYZ(
          i,
          curlX - radius * Math.sin(angle),
          oy + (dist * 0.08 * (oy / height3D)),
          oz + radius * (1 - Math.cos(angle)) * (1.0 - progress * 0.3)
        );
      } else {
        pos.setXYZ(i, ox, oy, oz);
      }
    }
    shadowMat.opacity = Math.sin(progress * Math.PI) * 0.32;
  }

  pos.needsUpdate = true;
  turnGeom.computeVertexNormals();
}

function startCurlAnimation(dir, from, to, duration, cb) {
  isAnimating = true;
  curlDirection = dir;
  animFrom = from;
  animTo = to;
  animDuration = duration || 420;
  animStart = performance.now();
  animCallback = cb;
}

window.refreshAllCanvases = function() {
  drawTextToCanvas(currentCv, currentData.currentText, currentData.chapterTitle, currentData.isFirstPage, currentData);
  drawTextToCanvas(nextCv, currentData.nextText, '', false, currentData);
  drawTextToCanvas(prevCv, currentData.prevText, '', false, currentData);

  currentTex.needsUpdate = true;
  nextTex.needsUpdate = true;
  prevTex.needsUpdate = true;
};

window.updatePageContent = function(newData) {
  currentData = newData;
  scene.background = new THREE.Color(newData.bgColor);

  window.refreshAllCanvases();

  turnMat.map = currentTex;
  underMat.map = nextTex;
  curlFactor = 0;
  applyCurl(0, 'forward');
  shadowMat.opacity = 0;
};

// Touch Gestures
let startX = 0;
let startY = 0;
let isDragging = false;
let dragDirection = null;

window.addEventListener('touchstart', (e) => {
  if (isAnimating) return;
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
  isDragging = true;
  dragDirection = null;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isDragging || isAnimating) return;
  const t = e.touches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  if (!dragDirection && Math.abs(dx) > 10) {
    if (dx < 0) {
      dragDirection = 'forward';
      turnMat.map = currentTex;
      underMat.map = nextTex;
    } else {
      dragDirection = 'backward';
      turnMat.map = prevTex;
      underMat.map = currentTex;
    }
  }

  if (dragDirection === 'forward') {
    curlFactor = Math.min(1, Math.max(0, -dx / (window.innerWidth * 0.75)));
    applyCurl(curlFactor, 'forward');
  } else if (dragDirection === 'backward') {
    curlFactor = Math.min(1, Math.max(0, dx / (window.innerWidth * 0.75)));
    applyCurl(1 - curlFactor, 'backward');
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (!isDragging || isAnimating) return;
  isDragging = false;
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
    const xRatio = startX / window.innerWidth;
    if (xRatio < 0.28) {
      turnMat.map = prevTex;
      underMat.map = currentTex;
      startCurlAnimation('backward', 1, 0, 360, () => rn('prev'));
    } else if (xRatio > 0.72) {
      turnMat.map = currentTex;
      underMat.map = nextTex;
      startCurlAnimation('forward', 0, 1, 360, () => rn('next'));
    } else {
      rn('tap_center');
    }
    return;
  }

  if (dragDirection === 'forward') {
    if (curlFactor > 0.28) {
      startCurlAnimation('forward', curlFactor, 1, 320 * (1 - curlFactor), () => rn('next'));
    } else {
      startCurlAnimation('forward', curlFactor, 0, 240 * curlFactor, null);
    }
  } else if (dragDirection === 'backward') {
    if (curlFactor > 0.28) {
      startCurlAnimation('backward', 1 - curlFactor, 0, 320 * (1 - curlFactor), () => rn('prev'));
    } else {
      startCurlAnimation('backward', 1 - curlFactor, 1, 240 * curlFactor, null);
    }
  }
}, { passive: true });

function animate(time) {
  requestAnimationFrame(animate);

  if (isAnimating) {
    const elapsed = time - animStart;
    const p = Math.min(1, elapsed / animDuration);
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    curlFactor = animFrom + (animTo - animFrom) * ease;
    applyCurl(curlFactor, curlDirection);

    if (p >= 1) {
      isAnimating = false;
      if (animCallback) animCallback();
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
</script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'next') {
              onNextPage();
            } else if (data.type === 'prev') {
              onPrevPage();
            } else if (data.type === 'tap_center') {
              onTapCenter();
            }
          } catch (e) {
            console.error('WebView message parsing error:', e);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
  },
});
