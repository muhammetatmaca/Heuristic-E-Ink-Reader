import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';

interface PDFViewerSurfaceProps {
  fileUri: string;
  currentPageIndex: number;
  onPageChanged: (pageIndex: number, totalPages: number) => void;
  onTapCenter: () => void;
}

export const PDFViewerSurface: React.FC<PDFViewerSurfaceProps> = ({
  fileUri,
  currentPageIndex,
  onPageChanged,
  onTapCenter,
}) => {
  const webViewRef = useRef<WebView>(null);
  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const paperBgColor =
    eink.paperType === 'book_parchment' ? '#F4F1D0' :
    eink.paperType === 'deckle_rough'   ? '#F3EEDC' :
    eink.paperType === 'japanese_washi' ? '#FAF5E8' :
    eink.paperType === 'kraft_recycled' ? '#E8DFC8' :
    eink.paperType === 'cotton_rag'     ? '#FAF7EE' :
    eink.paperType === 'newsprint'      ? '#EAE6DB' :
    theme.background;

  const effectiveBg = theme.isDark ? theme.background : paperBgColor;

  useEffect(() => {
    let isMounted = true;
    const loadPdfData = async () => {
      try {
        setLoading(true);
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (isMounted) {
          setBase64Pdf(base64);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF base64:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadPdfData();
    return () => {
      isMounted = false;
    };
  }, [fileUri]);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.goToPage) {
          window.goToPage(${currentPageIndex + 1});
        }
        true;
      `);
    }
  }, [currentPageIndex]);

  const einkCssFilter =
    eink.colorScheme === 'anti_halation'
      ? 'invert(90%) hue-rotate(180deg) contrast(115%)'
      : eink.colorScheme === 'pure_monochrome'
      ? 'grayscale(100%) contrast(125%)'
      : eink.colorScheme === 'amber_sepia'
      ? 'sepia(50%) hue-rotate(-15deg) contrast(105%)'
      : eink.colorScheme === 'warm_cream'
      ? 'sepia(20%) hue-rotate(-10deg) brightness(98%)'
      : 'none';

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updateFilter) {
          window.updateFilter('${einkCssFilter}', '${effectiveBg}');
        }
        true;
      `);
    }
  }, [einkCssFilter, effectiveBg]);

  if (loading || !base64Pdf) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
#pdf-canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  filter: ${einkCssFilter};
  mix-blend-mode: ${theme.isDark ? 'normal' : 'multiply'};
  transition: filter 0.2s ease;
}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
</head>
<body>
<canvas id="pdf-canvas"></canvas>

<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const pdfData = atob("${base64Pdf}");
let pdfDoc = null;
let pageNum = ${currentPageIndex + 1};
let pageRendering = false;
let pageNumPending = null;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

function rn(type, payload) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
  }
}

window.updateFilter = function(filterStr, bg) {
  canvas.style.filter = filterStr;
};

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale: 1.0 });
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const scaleX = (screenWidth * 0.96) / viewport.width;
    const scaleY = (screenHeight * 0.96) / viewport.height;
    const scale = Math.min(scaleX, scaleY);
    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);

    const scaledViewport = page.getViewport({ scale: scale * dpr });
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    canvas.style.width = (scaledViewport.width / dpr) + "px";
    canvas.style.height = (scaledViewport.height / dpr) + "px";

    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  rn('page_changed', { pageIndex: num - 1, totalPages: pdfDoc.numPages });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

window.goToPage = function(num) {
  if (num >= 1 && num <= pdfDoc.numPages) {
    pageNum = num;
    queueRenderPage(pageNum);
  }
};

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

pdfjsLib.getDocument({ data: pdfData }).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  renderPage(pageNum);
}).catch(function(err) {
  console.error('PDF JS Load Error:', err);
});

// Swipe gestures
let startX = 0;
let startY = 0;

window.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
    const xRatio = startX / window.innerWidth;
    if (xRatio < 0.25) {
      onPrevPage();
    } else if (xRatio > 0.75) {
      onNextPage();
    } else {
      rn('tap_center');
    }
    return;
  }

  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      onNextPage();
    } else {
      onPrevPage();
    }
  }
}, { passive: true });
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
        containerStyle={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'page_changed') {
              onPageChanged(data.payload.pageIndex, data.payload.totalPages);
            } else if (data.type === 'tap_center') {
              onTapCenter();
            }
          } catch (e) {
            console.error('PDF WebView message error:', e);
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
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
