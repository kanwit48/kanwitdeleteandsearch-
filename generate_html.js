const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const codePath = 'C:/Users/stdee/OneDrive/เอกสาร/ReactNativeProjects/kanwit/src/app/index.tsx';
const rawCode = fs.readFileSync(codePath, 'utf8');

// Escape HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const escapedCode = escapeHtml(rawCode);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeSnap - index.tsx</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f72585 100%);
      padding: 40px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      display: inline-block;
      min-width: 100%;
    }
    .window {
      background: #1e1e2e;
      border-radius: 16px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      max-width: 1050px;
      margin: 0 auto;
    }
    .window-header {
      background: #181825;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }
    .title {
      color: #a6adc8;
      font-size: 13px;
      font-weight: 600;
      margin-left: 12px;
      letter-spacing: 0.5px;
    }
    .code-container {
      display: flex;
      padding: 20px 0;
      background: #1e1e2e;
      font-size: 13px;
      line-height: 1.55;
    }
    .line-numbers {
      padding: 0 16px 0 20px;
      text-align: right;
      color: #585b70;
      user-select: none;
      font-size: 13px;
      line-height: 1.55;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
    }
    pre {
      margin: 0;
      padding: 0 24px;
      background: transparent !important;
      overflow: visible;
    }
    code {
      background: transparent !important;
      font-family: inherit !important;
      font-size: 13px !important;
      line-height: 1.55 !important;
      padding: 0 !important;
    }
  </style>
</head>
<body>
  <div class="window" id="capture">
    <div class="window-header">
      <span class="dot red"></span>
      <span class="dot yellow"></span>
      <span class="dot green"></span>
      <span class="title">kanwit/src/app/index.tsx</span>
    </div>
    <div class="code-container">
      <div class="line-numbers" id="line-numbers"></div>
      <pre><code class="language-typescript" id="code">${escapedCode}</code></pre>
    </div>
  </div>

  <script>
    hljs.highlightAll();
    const codeEl = document.getElementById('code');
    const lineCount = codeEl.innerText.split('\\n').length;
    const lineNumbersEl = document.getElementById('line-numbers');
    let nums = '';
    for (let i = 1; i <= lineCount; i++) {
      nums += i + '<br>';
    }
    lineNumbersEl.innerHTML = nums;
  </script>
</body>
</html>`;

fs.writeFileSync('C:/Users/stdee/OneDrive/เอกสาร/ReactNativeProjects/kanwit/codesnap.html', htmlContent, 'utf8');
console.log('codesnap.html created successfully');