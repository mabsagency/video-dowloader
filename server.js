const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const app = express();
const PORT = 3001;

// Global analysis history
let analysisHistory = [];

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'video.html'));
});

// API endpoint to get analysis history
app.get('/api/history', (req, res) => {
    res.json({ history: analysisHistory });
});

// API endpoint to analyze video URL
app.post('/api/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        console.log('Analyzing URL:', url);

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Detect platform
        const platform = detectPlatform(url);
        console.log('Detected platform:', platform);

        // Try to get real video info using yt-dlp; if it fails, return mock data
        try {
            console.log('Attempting real analysis with yt-dlp...');
            const videoInfo = await getVideoInfo(url);
            console.log('Video info retrieved:', videoInfo.title || 'no title');
            
            // Add to history
            addToAnalysisHistory(url, videoInfo, platform, false);
            
            return res.json({ success: true, platform, videoInfo });
        } catch (err) {
            console.warn('Real analysis failed, falling back to mock:', err && err.message);

            const mockVideoInfo = {
                title: getMockTitle(platform),
                duration: 245, // 4:05 in seconds
                thumbnail: getMockThumbnail(platform, url),
                formats: [
                    { format_id: '22', ext: 'mp4', resolution: '1280x720', filesize: 52428800, quality: '720p' },
                    { format_id: '18', ext: 'mp4', resolution: '640x360', filesize: 15728640, quality: '360p' },
                    { format_id: '140', ext: 'm4a', resolution: 'audio only', filesize: 3932160, quality: '128kbps' }
                ]
            };

            // Add to history
            addToAnalysisHistory(url, mockVideoInfo, platform, true);

            return res.json({ success: true, platform, videoInfo: mockVideoInfo, fallback: true, error: err && err.message });
        }

    } catch (error) {
        console.error('Error analyzing video:', error);
        res.status(500).json({
            error: 'Failed to analyze video',
            details: error.message
        });
    }
});

// API endpoint to download video
app.post('/api/download', async (req, res) => {
    try {
        const { url, format = 'mp4', quality = 'best', format_id = '' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Attempt real download using yt-dlp into downloads directory
        const timestamp = Date.now();
        const filename = `video_${timestamp}.${format}`;
        const outputPath = path.join(downloadsDir, filename);

        try {
            console.log('Starting real download with yt-dlp... format_id=', format_id);
            await downloadVideo(url, outputPath, format, quality, format_id);

            // Stream file to client
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const fileStream = fs.createReadStream(outputPath);
            fileStream.pipe(res);

            // Cleanup after streaming
            fileStream.on('end', () => {
                setTimeout(() => {
                    fs.unlink(outputPath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }, 5000);
            });

            return;
        } catch (err) {
            console.warn('Real download failed, falling back to sample:', err && err.message);
            // Fallback to sample content
            const sampleContent = `This is a sample ${format} file downloaded from ${url} at quality ${quality}. \nIn a real implementation, this would contain the actual video data.`;
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="video_sample.${format}"`);
            return res.send(Buffer.from(sampleContent));
        }

    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({
            error: 'Failed to download video',
            details: error.message
        });
    }
});

// Helper function to add to analysis history
function addToAnalysisHistory(url, videoInfo, platform, isFallback) {
    const historyItem = {
        id: Date.now(),
        url,
        videoInfo,
        platform,
        isFallback,
        timestamp: new Date().toISOString()
    };
    
    // Keep only last 50 items
    analysisHistory.unshift(historyItem);
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }
}

// Helper function to detect platform
function detectPlatform(url) {
    const platformPatterns = [
        { platform: 'youtube', pattern: /youtube\.com|youtu\.be/ },
        { platform: 'facebook', pattern: /facebook\.com|fb\.watch/ },
        { platform: 'instagram', pattern: /instagram\.com/ },
        { platform: 'tiktok', pattern: /tiktok\.com/ },
        { platform: 'twitter', pattern: /twitter\.com|x\.com/ },
        { platform: 'vimeo', pattern: /vimeo\.com/ },
        { platform: 'dramawave', pattern: /mydramawave\.com/ },
        { platform: 'dailymotion', pattern: /dailymotion\.com/ },
        { platform: 'twitch', pattern: /twitch\.tv/ },
        { platform: 'reddit', pattern: /reddit\.com/ },
        { platform: 'linkedin', pattern: /linkedin\.com/ }
    ];

    for (const { platform, pattern } of platformPatterns) {
        if (pattern.test(url)) {
            return platform;
        }
    }

    return 'unknown';
}

// Helper function to get mock title based on platform
function getMockTitle(platform) {
    const titles = {
        'youtube': 'Amazing Video Content - Best Tutorial Ever!',
        'facebook': 'Funny Cat Video - You Won\'t Believe This!',
        'instagram': 'Beautiful Sunset Timelapse #Nature #Photography',
        'tiktok': 'Dance Challenge 2024 - Viral Trend!',
        'twitter': 'Breaking News: Major Announcement Today',
        'vimeo': 'Professional Video Production Showcase',
        'dramawave': 'Drama Episode - Latest Korean Drama Series',
        'unknown': 'Sample Video Title'
    };
    return titles[platform] || 'Sample Video Title';
}

// Helper function to extract YouTube thumbnail from URL
function extractYouTubeThumbnail(url) {
    const match = url.match(/[?&]v=([^#\&\?]*)/) || url.match(/youtu\.be\/([^#\&\?]*)/);
    if (match) {
        const videoId = match[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
}

// Helper function to extract Vimeo thumbnail from URL
function extractVimeoThumbnail(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
        const videoId = match[1];
        return `https://vumbnail.com/${videoId}.jpg`;
    }
    return null;
}

// Helper function to extract Dailymotion thumbnail from URL
function extractDailymotionThumbnail(url) {
    const match = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (match) {
        const videoId = match[1];
        return `https://s1.dmcdn.net/v/${videoId}/x240`;
    }
    return null;
}

// Helper function to extract Twitch thumbnail from URL (for VODs)
function extractTwitchThumbnail(url) {
    const match = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (match) {
        const videoId = match[1];
        return `https://static-cdn.jtvnw.net/s3_vods/${videoId}/thumb/thumb0-320x180.jpg`;
    }
    return null;
}

// Helper function to extract TikTok thumbnail from URL
function extractTikTokThumbnail(url) {
    // Using a third-party service for TikTok thumbnails
    // Note: This may not be reliable and could break
    const encodedUrl = encodeURIComponent(url);
    return `https://tikthumb.vercel.app/api/thumb?url=${encodedUrl}`;
}

// Helper function to extract Instagram thumbnail from URL
function extractInstagramThumbnail(url) {
    // For Instagram, try to extract post ID and use a thumbnail service
    // This is experimental and may not work for all posts
    const match = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
    if (match) {
        const shortcode = match[1];
        return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    }
    return null;
}

// Helper function to get mock thumbnail based on platform
function getMockThumbnail(platform, url = '') {
    // Try to extract real thumbnail for known platforms
    if (platform === 'youtube' && url) {
        const realThumb = extractYouTubeThumbnail(url);
        if (realThumb) return realThumb;
    }
    if (platform === 'vimeo' && url) {
        const realThumb = extractVimeoThumbnail(url);
        if (realThumb) return realThumb;
    }
    if (platform === 'dailymotion' && url) {
        const realThumb = extractDailymotionThumbnail(url);
        if (realThumb) return realThumb;
    }
    if (platform === 'twitch' && url) {
        const realThumb = extractTwitchThumbnail(url);
        if (realThumb) return realThumb;
    }
    if (platform === 'tiktok' && url) {
        const realThumb = extractTikTokThumbnail(url);
        if (realThumb) return realThumb;
    }
    if (platform === 'instagram' && url) {
        const realThumb = extractInstagramThumbnail(url);
        if (realThumb) return realThumb;
    }

    // Fallback to seeded random image for consistency per URL
    let seed = 'default';
    if (url) {
        seed = url.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 1000;
    }

    return `https://picsum.photos/480/360?random=${seed}`;
}

// Helper function to download video
async function downloadVideo(url, outputPath, format, quality, format_id = '') {
    return new Promise((resolve, reject) => {
        // Build yt-dlp command based on format and quality
        let command;
        if (format === 'mp3' && !format_id) {
            // Audio only (no explicit format_id)
            command = `python -m yt_dlp -x --audio-format mp3 --audio-quality 192K -o "${outputPath}" "${url}"`;
        } else if (format_id) {
            // If a format_id is provided, use it directly
            // Use -f "<format_id>" to select the exact format
            command = `python -m yt_dlp -f "${format_id}" -o "${outputPath}" "${url}"`;
        } else {
            // Video with specific quality
            let qualityOption = '';
            switch (quality) {
                case 'best':
                    qualityOption = '-f best';
                    break;
                case '1080p':
                    qualityOption = '-f "best[height<=1080]"';
                    break;
                case '720p':
                    qualityOption = '-f "best[height<=720]"';
                    break;
                case '480p':
                    qualityOption = '-f "best[height<=480]"';
                    break;
                default:
                    qualityOption = '-f best';
            }

            command = `python -m yt_dlp ${qualityOption} -o "${outputPath}" "${url}"`;
        }

        exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

// Helper function to get video info using yt-dlp
async function getVideoInfo(url) {
    return new Promise((resolve, reject) => {
        const command = `python -m yt_dlp --dump-json "${url}"`;
        console.log('Executing command for getVideoInfo:', command);
        exec(command, { maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
            if (error) {
                console.error('yt-dlp exec error:', error, stderr);
                return reject(error);
            }
            try {
                const info = JSON.parse(stdout);
                const formats = info.formats ? info.formats.map(f => ({
                    format_id: f.format_id,
                    ext: f.ext,
                    resolution: f.resolution || f.format_note,
                    filesize: f.filesize || null,
                    quality: f.height ? `${f.height}p` : (f.abr ? `${f.abr}kbps` : f.format_note)
                })) : [];

                resolve({
                    title: info.title,
                    duration: info.duration,
                    thumbnail: info.thumbnail,
                    formats
                });
            } catch (parseErr) {
                console.error('Failed parsing yt-dlp output:', parseErr);
                reject(parseErr);
            }
        });
    });
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

if (require.main === module) {
    if (require.main === module) {
        app.listen(PORT, () => {
            console.log(`🚀 VidéoDownloader SaaS running at http://localhost:${PORT}`);
            console.log('📹 Ready to download videos from any platform!');
            console.log('🔧 Using mock data implementation (yt-dlp not available in this environment)');
        });
    }
}

// Export the app for Vercel
module.exports = app;

// Export helpers for local testing without starting the server
module.exports.helpers = {
    detectPlatform,
    getMockTitle,
    getMockThumbnail,
    formatFileSize
};