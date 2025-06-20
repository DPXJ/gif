// 全局变量
let currentResult = null;
let currentMethod = 'upload';

// DOM元素
const methodBtns = document.querySelectorAll('.method-btn');
const uploadSection = document.getElementById('upload-section');
const urlSection = document.getElementById('url-section');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const urlInput = document.getElementById('url-input');
const statusSection = document.getElementById('status-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');
const framesGrid = document.getElementById('frames-grid');
const frameData = document.getElementById('frame-data');
const frameCount = document.getElementById('frame-count');
const imageSize = document.getElementById('image-size');
const statusText = document.getElementById('status-text');
const errorText = document.getElementById('error-text');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 绑定事件监听器
    bindEventListeners();
    
    // 检查服务状态
    checkServiceHealth();
}

function bindEventListeners() {
    // 方法切换按钮
    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMethod(btn.dataset.method);
        });
    });

    // 文件上传相关
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // URL输入相关
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            extractFromUrl();
        }
    });
}

// 方法切换
function switchMethod(method) {
    currentMethod = method;
    
    // 更新按钮状态
    methodBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === method);
    });
    
    // 切换显示区域
    uploadSection.classList.toggle('hidden', method !== 'upload');
    urlSection.classList.toggle('hidden', method !== 'url');
    
    // 重置状态
    hideAllSections();
}

// 拖拽上传处理
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 文件选择处理
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (file.type !== 'image/gif') {
        showError('请选择GIF格式的文件');
        return;
    }
    
    uploadFile(file);
}

// 文件上传
async function uploadFile(file) {
    showStatus('正在上传GIF文件...');
    
    const formData = new FormData();
    formData.append('gifFile', file);
    
    try {
        const response = await fetch('/api/extract-frames', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result);
        } else {
            showError(result.error || '处理文件时发生错误');
        }
    } catch (error) {
        console.error('上传错误:', error);
        showError('上传文件失败，请检查网络连接');
    }
}

// URL处理
async function extractFromUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('请输入GIF文件的URL地址');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('请输入有效的URL地址');
        return;
    }
    
    showStatus('正在下载并处理GIF文件...');
    
    try {
        const response = await fetch('/api/extract-frames-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gifUrl: url })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result);
        } else {
            showError(result.error || '处理URL时发生错误');
        }
    } catch (error) {
        console.error('URL处理错误:', error);
        showError('处理URL失败，请检查网络连接和URL有效性');
    }
}

// 显示结果
function displayResults(result) {
    currentResult = result;
    
    // 更新信息
    frameCount.textContent = `总帧数: ${result.totalFrames}`;
    imageSize.textContent = `尺寸: ${result.originalWidth}x${result.originalHeight}`;
    
    // 显示抽样信息
    const sampleInfo = document.createElement('div');
    sampleInfo.className = 'sample-info';
    
    let sampleDescription = '';
    if (result.totalFrames < 10) {
        if (result.totalFrames <= 2) {
            sampleDescription = '全部帧';
        } else {
            sampleDescription = '首尾两帧';
        }
    } else if (result.totalFrames <= 20) {
        sampleDescription = '首、中、尾三帧';
    } else {
        sampleDescription = `均匀抽样5帧，间隔: ${result.sampleInterval}`;
    }
    
    sampleInfo.innerHTML = `
        <p><strong>抽样信息:</strong></p>
        <p>抽样帧数: ${result.sampleFrames.length}</p>
        <p>抽样策略: ${sampleDescription}</p>
        <p>抽样帧索引: [${result.sampleFrames.join(', ')}]</p>
    `;
    
    // 清空之前的抽样信息
    const existingSampleInfo = document.querySelector('.sample-info');
    if (existingSampleInfo) {
        existingSampleInfo.remove();
    }
    
    // 在信息区域后添加抽样信息
    const resultsInfo = document.querySelector('.results-info');
    resultsInfo.appendChild(sampleInfo);
    
    // 显示抽样帧图像
    displaySampleFrames(result);
    
    // 显示完整帧数据（保持原有功能）
    displayFrameData(result);
    
    // 显示结果区域
    hideAllSections();
    resultsSection.classList.remove('hidden');
}

// 显示抽样帧图像
async function displaySampleFrames(result) {
    framesGrid.innerHTML = '<div class="loading">正在加载抽样帧...</div>';
    
    try {
        // 请求抽样帧数据
        const response = await fetch(`/api/sample-frames?gifPath=${encodeURIComponent(result.gifPath)}&sampleFrames=${encodeURIComponent(JSON.stringify(result.sampleFrames))}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '获取抽样帧失败');
        }
        
        // 清空加载提示
        framesGrid.innerHTML = '';
        
        // 添加抽样说明
        const sampleHeader = document.createElement('div');
        sampleHeader.className = 'sample-header';
        sampleHeader.innerHTML = `
            <h3>抽样帧预览 (${data.sampleFrames.length}/${result.totalFrames})</h3>
            <p>为了优化性能，这里只显示抽样后的关键帧</p>
        `;
        framesGrid.appendChild(sampleHeader);
        
        // 显示抽样帧
        data.sampleFrames.forEach((frameData, index) => {
            const frameItem = document.createElement('div');
            frameItem.className = 'frame-item sample-frame';
            
            const img = document.createElement('img');
            img.className = 'frame-image';
            img.src = frameData.data;
            img.alt = `抽样帧 ${frameData.frameIndex + 1}`;
            img.loading = 'lazy';
            
            const frameLabel = document.createElement('div');
            frameLabel.className = 'frame-label';
            frameLabel.textContent = `帧 ${frameData.frameIndex + 1}`;
            
            frameItem.appendChild(img);
            frameItem.appendChild(frameLabel);
            framesGrid.appendChild(frameItem);
        });
        
        // 添加查看完整帧的按钮
        const viewAllButton = document.createElement('button');
        viewAllButton.className = 'view-all-button';
        viewAllButton.textContent = '查看所有帧';
        viewAllButton.onclick = () => displayAllFrames(result);
        framesGrid.appendChild(viewAllButton);
        
    } catch (error) {
        console.error('加载抽样帧失败:', error);
        framesGrid.innerHTML = `<div class="error">加载抽样帧失败: ${error.message}</div>`;
    }
}

// 显示所有帧（原有功能）
function displayAllFrames(result) {
    framesGrid.innerHTML = '<div class="loading">正在加载所有帧...</div>';
    
    // 添加返回抽样视图的按钮
    const backButton = document.createElement('button');
    backButton.className = 'back-to-sample-button';
    backButton.textContent = '返回抽样视图';
    backButton.onclick = () => displaySampleFrames(result);
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'all-frames-header';
    headerDiv.innerHTML = `<h3>所有帧预览 (${result.totalFrames}帧)</h3>`;
    headerDiv.appendChild(backButton);
    
    framesGrid.innerHTML = '';
    framesGrid.appendChild(headerDiv);
    
    // 显示所有帧
    for (let i = 0; i < result.totalFrames; i++) {
        const frameItem = document.createElement('div');
        frameItem.className = 'frame-item';
        
        const img = document.createElement('img');
        img.className = 'frame-image';
        img.src = `/api/frame/${i}?gifPath=${encodeURIComponent(result.gifPath)}`;
        img.alt = `帧 ${i + 1}`;
        img.loading = 'lazy';
        
        const frameLabel = document.createElement('div');
        frameLabel.className = 'frame-label';
        frameLabel.textContent = `帧 ${i + 1}`;
        
        frameItem.appendChild(img);
        frameItem.appendChild(frameLabel);
        framesGrid.appendChild(frameItem);
    }
}

// 显示帧数据
function displayFrameData(result) {
    const dataToShow = {
        success: result.success,
        totalFrames: result.totalFrames,
        originalWidth: result.originalWidth,
        originalHeight: result.originalHeight,
        gifPath: result.gifPath
    };
    
    frameData.textContent = JSON.stringify(dataToShow, null, 2);
}

// 下载所有帧
function downloadAllFrames() {
    if (!currentResult || currentResult.totalFrames === 0) {
        showError('没有可下载的帧');
        return;
    }
    
    for (let i = 0; i < currentResult.totalFrames; i++) {
        const link = document.createElement('a');
        link.href = `/api/frame/${i}?gifPath=${encodeURIComponent(currentResult.gifPath)}`;
        link.download = `frame_${i + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 复制帧数据
async function copyFrameData() {
    try {
        if (!currentResult) {
            showError('没有数据可复制');
            return;
        }

        const dataToCopy = {
            totalFrames: currentResult.totalFrames,
            originalWidth: currentResult.originalWidth,
            originalHeight: currentResult.originalHeight,
            gifPath: currentResult.gifPath
        };
        
        await navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
        
        // 显示成功提示
        const originalText = document.querySelector('.control-btn[onclick="copyFrameData()"]').innerHTML;
        const btn = document.querySelector('.control-btn[onclick="copyFrameData()"]');
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        btn.style.background = '#27ae60';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('复制失败:', error);
        showError('复制失败，请手动复制');
    }
}

// 重新开始
function resetApp() {
    currentResult = null;
    fileInput.value = '';
    urlInput.value = '';
    hideAllSections();
    
    // 重置到默认状态
    switchMethod('upload');
}

// 工具函数
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showStatus(message) {
    statusText.textContent = message;
    hideAllSections();
    statusSection.classList.remove('hidden');
}

function showError(message) {
    errorText.textContent = message;
    hideAllSections();
    errorSection.classList.remove('hidden');
}

function hideAllSections() {
    statusSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// 检查服务健康状态
async function checkServiceHealth() {
    try {
        const response = await fetch('/api/health');
        const result = await response.json();
        
        if (result.status !== 'ok') {
            console.warn('服务状态异常:', result);
        }
    } catch (error) {
        console.warn('无法连接到服务:', error);
    }
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('JavaScript错误:', e.error);
    showError('页面发生错误，请刷新重试');
});

// 网络状态监听
window.addEventListener('online', function() {
    console.log('网络连接已恢复');
});

window.addEventListener('offline', function() {
    console.log('网络连接已断开');
    showError('网络连接已断开，请检查网络设置');
}); 