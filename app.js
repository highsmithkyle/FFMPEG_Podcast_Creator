const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 10 }]), (req, res) => {
    const audioPath = req.files.audio[0].path;
    const images = req.files.image;
    const outputPath = `processed/podcast_${Date.now()}.mp4`;

   
    exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error}`);
            return res.status(500).send('Error processing audio file.');
        }

        const audioDuration = parseFloat(stdout); 
        const imageDisplayTime = audioDuration / images.length;

      
        let inputsStr = images.map((img, index) => `-loop 1 -t ${imageDisplayTime} -i "${img.path}" `).join(' ');
        let filterComplexStr = images.map((_, index) => `[${index}:v]scale=1280:720[img${index}];`).join('');
        let concatStr = images.map((_, index) => `[img${index}]`).join('');
        concatStr += `concat=n=${images.length}:v=1:a=0[v]`;

        const ffmpegCommand = `ffmpeg ${inputsStr} -i "${audioPath}" -filter_complex "${filterComplexStr}${concatStr}" -map "[v]" -map ${images.length}:a -c:v libx264 -c:a aac -pix_fmt yuv420p -shortest "${outputPath}"`;

       
        exec(ffmpegCommand, (ffmpegError, ffmpegStdout, ffmpegStderr) => {
            if (ffmpegError) {
                console.error(`Exec Error: ${ffmpegError}`);
                console.error(`FFmpeg Stderr: ${ffmpegStderr}`);
                return res.status(500).send('Error processing podcast.');
            }
            res.download(outputPath);
        });
    });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
