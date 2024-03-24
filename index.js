import http from 'http'
import path from 'path';
import express from 'express'
import {Server as SocketIO} from 'socket.io'
import {spawn} from 'child_process'

const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/4q1b-kfyk-1qvx-rut6-0u1c`,
];

const ffmpegProcess = spawn('ffmpeg',options)

ffmpegProcess.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
});

ffmpegProcess.stderr.on('data', (data) => {
    console.error(`ffmpeg stderr: ${data}`);
});

ffmpegProcess.on('close', (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
});

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server)

app.use(express.static(path.resolve('./public')))

io.on('connection',socket =>{
    console.log("Socket Connected", socket.id)
    socket.on('binarystream',stream=>{
        console.log("Binary Stream Incomming ",stream)
        ffmpegProcess.stdin.write(stream,(err)=>{
            console.log("err",err);
        })
    })
})

server.listen(5000,()=>console.log("http server running on port 5000"))
