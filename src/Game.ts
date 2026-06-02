import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { VaultScene } from './VaultScene';
import { VaultLogic } from './VaultLogic';

export class Game {
    public app!: PIXI.Application;
    private scene!: VaultScene;
    private logic!: VaultLogic;

    private startTime: number = 0;
    private isPlaying: boolean = false;
    private timerStarted: boolean = false;
    private animationFrameId: number | null = null;

    public async init() {
        const container = document.getElementById('game-container')!;

        this.app = new PIXI.Application<HTMLCanvasElement>({
            resizeTo: container,
            backgroundColor: 0x000000,
        });
        container.appendChild(this.app.view as HTMLCanvasElement);

        await this.loadAssets();

        this.scene = new VaultScene(this.app);
        this.logic = new VaultLogic();

        this.scene.onInteraction = async (dir) => {
            if (!this.isPlaying || this.scene.isAnimating) return;
            
            if (!this.timerStarted) {
                this.startTimer();
                this.timerStarted = true;
            }

            await this.scene.rotateHandle(dir);
            
            const result = this.logic.handleInput(dir);
            if (result === 'ERROR') {
                this.isPlaying = false;
                this.stopTimer();
                await this.scene.playErrorAnimation();
                this.resetGame();
            } else if (result === 'SUCCESS') {
                this.isPlaying = false;
                this.stopTimer();
                await this.scene.playSuccessAnimation();
                
                await new Promise(resolve => {
                    gsap.delayedCall(5, resolve);
                });
                
                await this.scene.closeVault();
                this.resetGame();
            }
        };

        this.resetGame();
        
        window.addEventListener('resize', () => {
            this.app.resize();
            this.scene.resize();
        });
    }

    private async loadAssets() {
        PIXI.Assets.add('background', '/assets/background.jpg');
        PIXI.Assets.add('doorClosed', '/assets/doorClosed.png');
        PIXI.Assets.add('doorHandle', '/assets/doorHandle.png');
        PIXI.Assets.add('doorHandleShadow', '/assets/doorHandleShadow.png');
        PIXI.Assets.add('doorOpen', '/assets/doorOpen.png');
        PIXI.Assets.add('shine', '/assets/shine.png');

        await PIXI.Assets.load([
            'background',
            'doorClosed',
            'doorHandle',
            'doorHandleShadow',
            'doorOpen',
            'shine'
        ]);
    }

    private resetGame() {
        this.logic.generateCode();
        this.isPlaying = true;
        this.timerStarted = false;
        this.scene.setTimerText('0.00');
        this.stopTimer();
    }

    private startTimer() {
        this.stopTimer();
        this.startTime = performance.now();
        
        const updateTimer = () => {
            if (!this.isPlaying) return;
            const elapsed = (performance.now() - this.startTime) / 1000;
            this.scene.setTimerText(elapsed.toFixed(2));
            this.animationFrameId = requestAnimationFrame(updateTimer);
        };
        this.animationFrameId = requestAnimationFrame(updateTimer);
    }

    private stopTimer() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
