const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// 配置 Sharp
sharp.cache(false); // 禁用缓存以减少内存使用
sharp.concurrency(1); // 限制并发处理数量
sharp.simd(true); // 启用 SIMD 优化

// 设置 Sharp 的最大像素限制（通过构造函数选项）
const SHARP_MAX_PIXELS = 268402689; // 16383 x 16383 pixels

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
}
if (!fsSync.existsSync(outputDir)) {
    fsSync.mkdirSync(outputDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gif-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(new Error('只支持GIF文件格式'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 限制文件大小为50MB
    }
});

// 安全删除文件函数
async function safeDeleteFile(filePath) {
    try {
        if (fsSync.existsSync(filePath)) {
            // 使用 fs.rm 替代 unlink，并添加重试逻辑
            for (let i = 0; i < 3; i++) {
                try {
                    await fs.rm(filePath, { force: true });
                    break;
                } catch (err) {
                    if (i === 2) throw err; // 最后一次尝试失败时抛出错误
                    await new Promise(resolve => setTimeout(resolve, 100)); // 等待100ms后重试
                }
            }
        }
    } catch (error) {
        console.warn(`警告: 删除文件失败 ${filePath}:`, error.message);
    }
}

// GIF帧元数据提取函数
async function extractGifMetadata(gifPath) {
    try {
        // 使用构造函数选项设置最大像素限制
        const image = sharp(gifPath, { 
            animated: true,
            limitInputPixels: SHARP_MAX_PIXELS
        });

        const metadata = await image.metadata();

        // 检查图像尺寸
        const totalPixels = metadata.width * metadata.height;
        if (totalPixels > SHARP_MAX_PIXELS) {
            throw new Error(`图像尺寸过大: ${metadata.width}x${metadata.height} 像素`);
        }
        
        return {
            success: true,
            totalFrames: metadata.pages,
            originalWidth: metadata.width,
            originalHeight: metadata.height
        };
    } catch (error) {
        console.error('GIF元数据提取错误:', error);
        return {
            success: false,
            error: error.message || '处理GIF文件时发生错误'
        };
    }
}

// 从URL下载GIF文件
async function downloadGifFromUrl(url) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024 // 50MB
        });
        
        if (!response.headers['content-type']?.includes('image/gif')) {
            throw new Error('URL指向的不是GIF文件');
        }
        
        const filename = `gif-${Date.now()}-${Math.round(Math.random() * 1E9)}.gif`;
        const filepath = path.join(uploadDir, filename);
        
        await fs.writeFile(filepath, response.data);
        return filepath;
    } catch (error) {
        if (error.response) {
            throw new Error(`下载失败: HTTP ${error.response.status}`);
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('下载超时');
        } else {
            throw new Error(`下载失败: ${error.message}`);
        }
    }
}

// API路由

// 上传GIF文件并分解帧
app.post('/api/extract-frames', upload.single('gifFile'), async (req, res) => {
    let gifPath = null;
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '请上传GIF文件'
            });
        }

        gifPath = req.file.path;
        const result = await extractGifMetadata(gifPath);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        result.gifPath = gifPath;
        res.json(result);
    } catch (error) {
        console.error('处理上传文件错误:', error);
        res.status(500).json({
            success: false,
            error: error.message || '处理文件时发生错误'
        });
    } finally {
        // 延迟删除文件，确保文件处理完成
        if (gifPath) {
            setTimeout(async () => {
                await safeDeleteFile(gifPath);
            }, 300000); // 5分钟后删除
        }
    }
});

// 从URL分解GIF帧
app.post('/api/extract-frames-url', async (req, res) => {
    let gifPath = null;
    try {
        const { gifUrl } = req.body;
        
        if (!gifUrl) {
            return res.status(400).json({
                success: false,
                error: '请提供GIF文件URL'
            });
        }

        // 下载GIF文件
        gifPath = await downloadGifFromUrl(gifUrl);
        
        // 分解帧
        const result = await extractGifMetadata(gifPath);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        result.gifPath = gifPath;
        res.json(result);
    } catch (error) {
        console.error('处理URL错误:', error);
        res.status(500).json({
            success: false,
            error: error.message || '处理URL时发生错误'
        });
    } finally {
        // 延迟删除文件，确保文件处理完成
        if (gifPath) {
            setTimeout(async () => {
                await safeDeleteFile(gifPath);
            }, 300000); // 5分钟后删除
        }
    }
});

// 获取帧图像数据
app.get('/api/frame/:frameIndex', async (req, res) => {
    try {
        const { frameIndex } = req.params;
        const { gifPath } = req.query;
        
        if (!gifPath || !fsSync.existsSync(gifPath)) {
            return res.status(404).json({
                success: false,
                error: 'GIF文件不存在'
            });
        }

        // 先将文件读入内存
        const gifBuffer = await fs.readFile(gifPath);

        const frameBuffer = await sharp(gifBuffer, { 
            page: parseInt(frameIndex)
        })
        .png()
        .toBuffer();
        
        res.set('Content-Type', 'image/png');
        res.send(frameBuffer);
    } catch (error) {
        console.error('获取帧错误:', error);
        res.status(500).json({
            success: false,
            error: error.message || '获取帧时发生错误'
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'GIF帧分解服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 GIF帧分解服务已启动，端口: ${PORT}`);
    console.log(`📁 上传目录: ${uploadDir}`);
    console.log(`📁 输出目录: ${outputDir}`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
}); 