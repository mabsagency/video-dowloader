const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'video.html'));
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

        // Detect platform (simplified)
        const platform = 'youtube';

        // Return mock data
        const mockVideoInfo = {
            title: 'Test Video',
            duration: 245,
            thumbnail: 'https://via.placeholder.com/480x360',
            formats: [
                { format_id: '22', ext: 'mp4', resolution: '1280x720', filesize: 52428800, quality: '720p' },
                { format_id: '18', ext: 'mp4', resolution: '640x360', filesize: 15728640, quality: '360p' },
                { format_id: '140', ext: 'm4a', resolution: 'audio only', filesize: 3932160, quality: '128kbps' }
            ]
        };

        return res.json({ success: true, platform, videoInfo: mockVideoInfo });

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

        // Mock download - just return success
        res.json({
            success: true,
            message: 'Download would start here',
            url,
            format,
            quality,
            format_id
        });

    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({
            error: 'Failed to download video',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 VidéoDownloader SaaS running at http://localhost:${PORT}`);
    console.log('📹 Ready to download videos from any platform!');
    console.log('🔧 Using simplified mock implementation');
});