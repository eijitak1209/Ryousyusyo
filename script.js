const { jsPDF } = window.jspdf;
let collectedImages = [];

document.getElementById('addBtn').addEventListener('click', () => {
  document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    collectedImages.push(e.target.files[0]);
    document.getElementById('fileCount').innerText = `現在の画像枚数: ${collectedImages.length} 枚`;
  }
});

// Canvasや回転計算を完全に排除。ブラウザが解釈したimg要素をそのまま返す
async function getImageElement(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

document.getElementById('generateBtn').addEventListener('click', async () => {
  if (collectedImages.length === 0) return alert("画像を撮影してください");

  const doc = new jsPDF(document.getElementById('orientation').value, 'mm', 'a4');
  const cols = parseInt(document.getElementById('cols').value);
  const rows = parseInt(document.getElementById('rows').value);
  const cellsPerPage = cols * rows;

  for (let i = 0; i < collectedImages.length; i++) {
    if (i > 0 && i % cellsPerPage === 0) doc.addPage();

    // 直接img要素を取得
    const img = await getImageElement(collectedImages[i]);
    
    const indexOnPage = i % cellsPerPage;
    const colIdx = indexOnPage % cols;
    const rowIdx = Math.floor(indexOnPage / cols);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cellW = pageWidth / cols;
    const cellH = pageHeight / rows;

    // ブラウザが既に補正済みの naturalWidth/Height を基準に計算
    const ratio = Math.min((cellW - 10) / img.naturalWidth, (cellH - 10) / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    const x = (colIdx * cellW) + (cellW - w) / 2;
    const y = (rowIdx * cellH) + (cellH - h) / 2;

    // 加工をせず、img要素をそのまま渡す（jsPDFが画像として処理）
    doc.addImage(img, 'JPEG', x, y, w, h);
  }
  doc.save("receipt.pdf");
});
