
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

        this.animationFrameId = null;
        this.resizeHandler = this.resizeCanvas.bind(this);
        this.clickHandler = () => (this.gamePlaying = true);
        this.flightHandler = () => (this.flight = this.jump);
        this.keydownHandler = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                this.gamePlaying = true;
                this.flight = this.jump;
            }
        };
    }

    pipeLoc() {
        return Math.random() * (this.canvas.height - (this.pipeGap + this.pipeWidth) - this.pipeWidth) + this.pipeWidth;
    }

    setup() {
        this.currentScore = 0;
        this.flight = this.jump;
        this.flyHeight = this.canvas.height / 2 - this.size[1] / 2;

        this.pipes = Array(3)
            .fill()
            .map((a, i) => [this.canvas.width + i * (this.pipeGap + this.pipeWidth), this.pipeLoc()]);
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
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 30px courier";
            this.ctx.fillText(`Best score : ${this.bestScore}`, 85, 245);
            this.ctx.fillText("Click to play", 90, 535);
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
            <canvas id="flappyCanvas" style="display: block; width: 100%; height: 100%;"></canvas>
        `;

        this.canvas = this.container.querySelector('#flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElements = {
            best: this.container.querySelector('#flappyBestScore'),
            current: this.container.querySelector('#flappyCurrentScore')
        };

        this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler);

        // Event listeners
        this.canvas.addEventListener('click', this.clickHandler);
        window.addEventListener('click', this.flightHandler);
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
        }
        window.removeEventListener('click', this.flightHandler);
        window.removeEventListener('keydown', this.keydownHandler);

        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
