// 以下の 画像ファイルのパス, アルファ値に対応した文字列のマップ を編集

// 画像ファイルのパス
const imageFileName = 'room.png';
// アルファ値に対応した文字列のマップ
const alphaMapping = {
    254: 'wood flooring',
    253: 'wall',
    252: 'window',
    251: 'baseboard',
    250: 'ceiling',
    249: 'table',
    248: 'chair',
    247: 'houseplant',
    246: 'sky',
    default: 'background'
}

// canvas要素の幅（画面幅の70%）
function getCanvasWidth() {
    const availableWidth = Math.min(
        window.innerWidth,
        document.documentElement.clientWidth
    );
    return Math.floor(availableWidth * 0.7);
}
let canvasWidth = getCanvasWidth();

const canvas = document.getElementById('output-canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.crossOrigin = "Anonymous";
img.src = imageFileName;

let imageData = null;
let data = null;
let originalAlphaData = null;
let scaleX = 1;
let scaleY = 1;

// マウス追従用の要素を作成
const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

img.onload = () => {
    // canvasのアスペクト比を画像に揃える
    const aspectRatio = img.height / img.width;
    canvas.width = canvasWidth;
    canvas.height = Math.round(canvasWidth * aspectRatio);
    
    // スケール比を計算
    scaleX = img.width / canvas.width;
    scaleY = img.height / canvas.height;

    // 画像をcanvasのサイズに合わせて描画
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 元画像のピクセルデータを取得するため、一時的なcanvasを作成
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    
    // 元画像のピクセルデータを取得
    const tempImageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const tempData = tempImageData.data;

    // 元の透明度情報を保存
    originalAlphaData = new Uint8Array(img.width * img.height);
    let pixelIndex = 0;

    // アルファ値を別に保存
    for (let i = 3; i < tempData.length; i += 4) {
        originalAlphaData[pixelIndex] = tempData[i];
        pixelIndex++;
    }

    // 表示用のcanvasの画像データを取得
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;

    // アルファチャネルを不透明に設定
    for (let i = 3; i < data.length; i += 4) {
        data[i] = 255;
    }

    // 変更したピクセルデータをキャンバスに戻す
    ctx.putImageData(imageData, 0, 0);
};

// 座標からアルファ情報を取得
function getInfoFromPosition(clientX, clientY) {
    // canvasの境界を取得
    const rect = canvas.getBoundingClientRect();
    
    // 相対位置を計算（canvas上の座標）
    const canvasX = Math.floor(clientX - rect.left);
    const canvasY = Math.floor(clientY - rect.top);
    
    // 境界チェック
    if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) {
        return null;
    }
    
    // canvas座標を元画像の座標に変換
    const originalX = Math.floor(canvasX * scaleX);
    const originalY = Math.floor(canvasY * scaleY);
    
    // 元画像の境界チェック
    if (originalX >= img.width || originalY >= img.height) {
        return null;
    }
    
    // 元画像でのピクセルのインデックスを計算
    const pixelIndex = originalY * img.width + originalX;

    // 元の透明度情報を取得
    const originalAlpha = originalAlphaData[pixelIndex];

    // アルファの値をもとに文字列を取得
    const text = alphaMapping[originalAlpha] || alphaMapping.default;
    
    return {
        text: text,
        canvasX: canvasX,
        canvasY: canvasY
    };
}

// ツールチップを表示する関数
function showTooltip(text, clientX, clientY) {
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.left = (clientX + 40) + 'px';
    tooltip.style.top = (clientY - 40) + 'px';
}

// ツールチップを非表示
function hideTooltip() {
    tooltip.style.display = 'none';
}

// マウスの動きに応じてツールチップを表示
canvas.addEventListener('mousemove', (event) => {
    const info = getInfoFromPosition(event.clientX, event.clientY);
    
    if (info) {
        showTooltip(info.text, event.clientX, event.clientY);
    } else {
        hideTooltip();
    }
});

// マウスがcanvasから離れた時
canvas.addEventListener('mouseleave', () => {
    hideTooltip();
});

// モバイル対応（画面タッチ）
// タッチしたとき
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const info = getInfoFromPosition(touch.clientX, touch.clientY);
    if (info) {
        showTooltip(info.text, touch.clientX, touch.clientY);
    }
});

// タッチの位置が動いたとき
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const info = getInfoFromPosition(touch.clientX, touch.clientY);
    if (info) {
        showTooltip(info.text, touch.clientX, touch.clientY);
    } else {
        hideTooltip();
    }
});

// タッチ終了
canvas.addEventListener('touchend', (event) => {
    event.preventDefault();
    hideTooltip();
});

// タッチキャンセル
canvas.addEventListener('touchcancel', (event) => {
    event.preventDefault();
    hideTooltip();
});