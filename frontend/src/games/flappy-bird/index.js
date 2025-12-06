
export class FlappyBirdGame {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.img = new Image();
        this.img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

        // Game state
        this.gamePlaying = false;
        this.isPaused = false;
        this.isMuted = false;
        this.gravity = 0.5;
        this.speed = 6.2;
        this.size = [51, 36];
        this.jump = -11.5;
        this.cTenth = 0;

        this.index = 0;
        this.bestScore = 0;
        this.flight = 0;
        this.flyHeight = 0;
        this.currentScore = 0;
        this.pipes = [];

        this.pipeWidth = 78;
        this.pipeGap = 270;

        // Audio
        this.flapSound = new Audio('/assets/flappy/sounds/sfx_flap.mp3');
        this.dieSound = new Audio('/assets/flappy/sounds/sfx_die.mp3');

        this.animationFrameId = null;
        this.resizeHandler = this.resizeCanvas.bind(this);
        this.clickHandler = () => {
            if (this.isPaused) return;
            this.gamePlaying = true;
            const btn = document.getElementById('flappyPauseBtn');
            if (btn) btn.style.display = 'block';
        };
        this.flightHandler = () => {
            if (this.isPaused) return;
            this.flight = this.jump;
            if (this.gamePlaying && !this.isMuted) this.flapSound.cloneNode(true).play().catch(e => console.log('Audio play failed', e));
        };

        this.touchStartHandler = (e) => {
            if (e.cancelable) e.preventDefault();
            this.clickHandler();
        };
        this.touchFlightHandler = (e) => {
            if (e.cancelable) e.preventDefault();
            this.flightHandler();
        };
        this.keydownHandler = (e) => {
            if (e.code === "Escape") {
                e.preventDefault();
                this.togglePause();
                return;
            }
            if (e.code === "Space") {
                e.preventDefault();
                if (this.isPaused) return;
                this.gamePlaying = true;
                // Show pause button when game starts
                const btn = document.getElementById('flappyPauseBtn');
                if (btn) btn.style.display = 'block';

                this.flight = this.jump;
                if (this.gamePlaying && !this.isMuted) this.flapSound.cloneNode(true).play().catch(e => console.log('Audio play failed', e));
            }
        };
    }

    togglePause() {
        // Only allow pausing if game has started
        if (!this.gamePlaying) return;

        this.isPaused = !this.isPaused;

        const menu = document.getElementById('flappyPauseMenu');

        if (this.isPaused) {
            cancelAnimationFrame(this.animationFrameId);
            if (menu) menu.style.display = 'flex';
        } else {
            if (menu) menu.style.display = 'none';
            this.render();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('flappyMuteBtn');
        if (btn) btn.innerText = this.isMuted ? "Unmute Sound" : "Mute Sound";
    }

    pipeLoc() {
        return Math.random() * (this.canvas.height - (this.pipeGap + this.pipeWidth) - this.pipeWidth) + this.pipeWidth;
    }

    setup() {
        this.currentScore = 0;
        this.flight = this.jump;
        this.flyHeight = this.canvas.height / 2 - this.size[1] / 2;

        // Calculate how many pipes we need to fill the screen
        const pipeSpacing = this.pipeGap + this.pipeWidth;
        const pipesNeeded = Math.ceil(this.canvas.width / pipeSpacing) + 1;

        this.pipes = Array(pipesNeeded)
            .fill()
            .map((a, i) => [this.canvas.width + i * pipeSpacing, this.pipeLoc()]);

        // Hide pause button on reset/setup
        const btn = document.getElementById('flappyPauseBtn');
        if (btn) btn.style.display = 'none';
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.height = 768;
        this.canvas.width = Math.min(window.innerWidth, 431); // Limit width to background size or screen
        // Adjust for full screen feel if needed, but original code had specific aspect ratio logic
        // Let's stick to original logic but adapted for container
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;

        // Re-implementing original logic roughly but fitting to container
        // The original logic: canvas.width = window.innerWidth * (canvas.height / window.innerHeight);
        // This maintains aspect ratio. Let's try to just fill container.

        this.cTenth = this.canvas.width / 10;
    }

    render() {
        if (!this.ctx) return;

        this.index++;

        // Background
        // We need to handle the background scrolling. 
        // The original code assumes a specific image layout.
        // img width 431, height 768.

        // Draw background (first part)
        this.ctx.drawImage(
            this.img,
            0, 0, 431, 768,
            -((this.index * (this.speed / 2)) % this.canvas.width) + this.canvas.width, 0, this.canvas.width, this.canvas.height
        );
        // Background (second part)
        this.ctx.drawImage(
            this.img,
            0, 0, 431, 768,
            -(this.index * (this.speed / 2)) % this.canvas.width, 0, this.canvas.width, this.canvas.height
        );

        // Pipe display
        if (this.gamePlaying) {
            this.pipes.map((pipe) => {
                pipe[0] -= this.speed;

                // Top pipe
                this.ctx.drawImage(
                    this.img,
                    432, 588 - pipe[1], this.pipeWidth, pipe[1],
                    pipe[0], 0, this.pipeWidth, pipe[1]
                );
                // Bottom pipe
                this.ctx.drawImage(
                    this.img,
                    432 + this.pipeWidth, 108, this.pipeWidth, this.canvas.height - pipe[1] + this.pipeGap,
                    pipe[0], pipe[1] + this.pipeGap, this.pipeWidth, this.canvas.height - pipe[1] + this.pipeGap
                );

                // Give 1 point & create new pipe
                if (pipe[0] <= -this.pipeWidth) {
                    this.currentScore++;
                    this.bestScore = Math.max(this.bestScore, this.currentScore);

                    // Remove & create new pipe
                    this.pipes = [
                        ...this.pipes.slice(1),
                        [this.pipes[this.pipes.length - 1][0] + this.pipeGap + this.pipeWidth, this.pipeLoc()],
                    ];
                }

                // Collision detection
                if (
                    [
                        pipe[0] <= this.cTenth + this.size[0],
                        pipe[0] + this.pipeWidth >= this.cTenth,
                        pipe[1] > this.flyHeight || pipe[1] + this.pipeGap < this.flyHeight + this.size[1],
                    ].every((elem) => elem)
                ) {
                    if (!this.isMuted) this.dieSound.play().catch(e => console.log('Audio play failed', e));
                    this.gamePlaying = false;
                    this.setup();
                }
            });
        }

        // Draw bird
        if (this.gamePlaying) {
            this.ctx.drawImage(
                this.img,
                432, Math.floor((this.index % 9) / 3) * this.size[1], ...this.size,
                this.cTenth, this.flyHeight, ...this.size
            );
            this.flight += this.gravity;
            this.flyHeight = Math.min(this.flyHeight + this.flight, this.canvas.height - this.size[1]);
        } else {
            this.ctx.drawImage(
                this.img,
                432, Math.floor((this.index % 9) / 3) * this.size[1], ...this.size,
                this.canvas.width / 2 - this.size[0] / 2, this.flyHeight, ...this.size
            );
            this.flyHeight = this.canvas.height / 2 - this.size[1] / 2;

            // Text
            // Text
            /*
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 30px courier";
            this.ctx.fillText(`Best score : ${this.bestScore}`, 85, 245);
            this.ctx.fillText("Click to play", 90, 535);
            */

            // New UI
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.font = "bold 40px 'Courier New', sans-serif";
            this.ctx.textAlign = "center"; // Center text
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Flappy Bird", this.canvas.width / 2, this.canvas.height / 2 - 50);

            this.ctx.font = "20px 'Courier New', sans-serif";
            const startText = window.innerWidth <= 768 ? "Click to Play" : "Click or Press Space to Play";
            this.ctx.fillText(startText, this.canvas.width / 2, this.canvas.height / 2 + 10);

            this.ctx.fillText(`Best Score: ${this.bestScore}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.textAlign = "start"; // Reset alignment
        }

        // Update score display
        if (this.scoreElements.best) this.scoreElements.best.innerHTML = `Best : ${this.bestScore}`;
        if (this.scoreElements.current) this.scoreElements.current.innerHTML = `Current : ${this.currentScore}`;

        this.animationFrameId = window.requestAnimationFrame(this.render.bind(this));
    }

    launch() {
        if (!this.container) return;

        // Create UI structure
        this.container.innerHTML = `
            <div style="position: absolute; top: 20px; left: 20px; color: white; font-family: courier; z-index: 10;">
                <div id="flappyBestScore"></div>
                <div id="flappyCurrentScore"></div>
            </div>
            
            <!-- Pause Button (Hidden initially) -->
            <div id="flappyPauseBtn" style="display: none; position: absolute; top: 20px; right: 20px; z-index: 20; cursor: pointer; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </div>

            <!-- Pause Menu -->
            <div id="flappyPauseMenu" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 30; flex-direction: column; justify-content: center; align-items: center; gap: 20px;">
                <h2 style="color: white; font-family: 'Courier New', sans-serif; font-size: 40px; margin: 0;">PAUSED</h2>
                <button id="flappyResumeBtn" style="padding: 15px 30px; font-size: 20px; font-family: 'Courier New', sans-serif; cursor: pointer; background: #4EC0CA; border: none; color: white; border-radius: 5px;">RESUME</button>
                <button id="flappyMuteBtn" style="padding: 15px 30px; font-size: 20px; font-family: 'Courier New', sans-serif; cursor: pointer; background: #fca048; border: none; color: white; border-radius: 5px;">Mute Sound</button>
            </div>

            <canvas id="flappyCanvas" style="display: block; width: 100%; height: 100%;"></canvas>
        `;

        // Bind Pause UI events
        const pauseBtn = this.container.querySelector('#flappyPauseBtn');
        const handlePauseClick = (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevent triggering flight
            this.togglePause();
        };
        pauseBtn.addEventListener('click', handlePauseClick);
        pauseBtn.addEventListener('touchstart', handlePauseClick, { passive: false });

        this.container.querySelector('#flappyResumeBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePause();
        });
        this.container.querySelector('#flappyMuteBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMute();
        });

        // Prevent touches on menu from propagating to game
        const menu = this.container.querySelector('#flappyPauseMenu');
        menu.addEventListener('touchstart', (e) => e.stopPropagation());
        menu.addEventListener('click', (e) => e.stopPropagation());

        this.canvas = this.container.querySelector('#flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElements = {
            best: this.container.querySelector('#flappyBestScore'),
            current: this.container.querySelector('#flappyCurrentScore')
        };

        this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler);

        // Event listeners
        // Event listeners
        this.canvas.addEventListener('click', this.clickHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });

        window.addEventListener('click', this.flightHandler);
        window.addEventListener('touchstart', this.touchFlightHandler, { passive: false });

        window.addEventListener('keydown', this.keydownHandler);

        this.setup();

        if (this.img.complete) {
            this.render();
        } else {
            this.img.onload = () => this.render();
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        window.removeEventListener('resize', this.resizeHandler);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.clickHandler);
            this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        }
        window.removeEventListener('click', this.flightHandler);
        window.removeEventListener('touchstart', this.touchFlightHandler);
        window.removeEventListener('keydown', this.keydownHandler);

        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
