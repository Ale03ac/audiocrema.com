document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause');
    const volumeSlider = document.getElementById('volume');
    const progressBar = document.getElementById('progress');
    const currentTrackSpan = document.getElementById('current-track');
    const playlistElement = document.getElementById('playlist');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');

    let currentTrack = null;
    let isPlaying = false;

    // Lista de reproducción de ejemplo
    const playlist = [
        { title: 'CambioAlPesto', file: 'ruta/a/cambiodepuesto.wav' },
        { title: 'BeibiShitter', file: 'ruta/a/cancion1.wav' },
        { title: 'HowManyMan', file: 'ruta/a/cancion3.wav' },
    ];

    // Crear la lista de reproducción en el HTML
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.title;
        li.addEventListener('click', () => playTrack(index));
        playlistElement.appendChild(li);
    });

    // Configurar Howler.js
    Howler.html5PoolSize = 10; // Para reducir la latencia

    function playTrack(index) {
        if (currentTrack) {
            currentTrack.stop();
        }

        currentTrack = new Howl({
            src: [playlist[index].file],
            html5: true,
            onplay: () => {
                isPlaying = true;
                playPauseBtn.textContent = 'Pause';
                currentTrackSpan.textContent = playlist[index].title;
                requestAnimationFrame(updateVisualizer);
            },
            onpause: () => {
                isPlaying = false;
                playPauseBtn.textContent = 'Play';
            },
            onstop: () => {
                isPlaying = false;
                playPauseBtn.textContent = 'Play';
            },
            onend: () => {
                playTrack((index + 1) % playlist.length);
            }
        });

        currentTrack.play();
    }

    playPauseBtn.addEventListener('click', () => {
        if (currentTrack) {
            if (isPlaying) {
                currentTrack.pause();
            } else {
                currentTrack.play();
            }
        } else {
            playTrack(0);
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        Howler.volume(e.target.value);
    });

    function updateVisualizer() {
        const analyser = Howler.ctx.createAnalyser();
        Howler.masterGain.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
    
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
    
        // Ajustar el tamaño del canvas si es necesario
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
    
        function renderFrame() {
            requestAnimationFrame(renderFrame);
    
            analyser.getByteFrequencyData(dataArray);
    
            // Limpiar el canvas con un color de fondo gris oscuro
            ctx.fillStyle = 'rgb(30, 30, 30)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
            const barWidth = (WIDTH / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
    
            // Dibujar las barras del visualizador
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
    
                // Cambiar el color de las barras para mayor visibilidad
                ctx.fillStyle = `rgb(${barHeight + 50}, ${barHeight + 50}, 255)`;
                ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    
                x += barWidth + 1;
            }
        }
    
        // Iniciar la animación
        renderFrame();
    }

    // Actualizar la barra de progreso
    setInterval(() => {
        if (currentTrack && isPlaying) {
            const progress = (currentTrack.seek() / currentTrack.duration()) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }, 1000);
});