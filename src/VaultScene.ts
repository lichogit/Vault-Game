import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Direction } from './VaultLogic';

export class VaultScene {
    private app: PIXI.Application;
    private container: PIXI.Container;

    private bg!: PIXI.Sprite;
    private doorOpen!: PIXI.Sprite;
    private doorClosed!: PIXI.Sprite;
    private handleShadow!: PIXI.Sprite;
    private handle!: PIXI.Sprite;
    private shine!: PIXI.Sprite;
    private timerText!: PIXI.Text;

    private leftHitArea!: PIXI.Graphics;
    private rightHitArea!: PIXI.Graphics;

    public isAnimating: boolean = false;
    public onInteraction?: (dir: Direction) => void;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.setupScene();
        this.resize();
        (window as any).doorGroup = this.doorGroup;
        (window as any).vaultScene = this;
    }

    private doorGroup!: PIXI.Container;
    private doorPanel!: PIXI.Container;

    private setupScene() {
        this.doorGroup = new PIXI.Container();

        this.bg = PIXI.Sprite.from('background');
        this.bg.anchor.set(0.5);

        this.doorOpen = PIXI.Sprite.from('doorOpen');
        this.doorOpen.anchor.set(0.5, 0.5);
        this.doorOpen.visible = false;

        this.doorClosed = PIXI.Sprite.from('doorClosed');
        this.doorClosed.anchor.set(0.5);

        this.handleShadow = PIXI.Sprite.from('doorHandleShadow');
        this.handleShadow.anchor.set(0.5);

        this.handle = PIXI.Sprite.from('doorHandle');
        this.handle.anchor.set(0.5);

        this.shine = PIXI.Sprite.from('shine');
        this.shine.anchor.set(0.5);
        this.shine.visible = false;
        this.shine.blendMode = PIXI.BLEND_MODES.ADD;


        this.doorPanel = new PIXI.Container();
        this.doorPanel.addChild(this.doorClosed);
        this.doorPanel.addChild(this.handleShadow);
        this.doorPanel.addChild(this.handle);

        // Set pivot to the right edge of the door (the hinge point)
        const halfDoorW = this.doorClosed.texture.width / 2;
        this.doorPanel.pivot.x = halfDoorW;
        this.doorPanel.x = halfDoorW; // compensate so it renders in the same position


        this.doorOpen.x = halfDoorW + this.doorOpen.texture.width / 2 - 160;
        this.doorOpen.y = 0;

        this.doorGroup.addChild(this.doorOpen);
        this.doorGroup.addChild(this.shine);
        this.doorGroup.addChild(this.doorPanel);

        this.doorGroup.scale.set(1.145);
        this.doorGroup.x = 70.8;
        this.doorGroup.y = -90.1;


        this.handle.x = -20;
        this.handle.y = 0;
        this.handleShadow.x = -20;
        this.handleShadow.y = 0;

        this.timerText = new PIXI.Text('0.00', {
            fontFamily: 'monospace',
            fontSize: 24,
            fill: 0x00ff00,
            dropShadow: true,
            dropShadowColor: '#00ff00',
            dropShadowBlur: 10,
            dropShadowDistance: 0
        });
        this.timerText.anchor.set(0.5);

        this.container.addChild(this.bg);
        this.container.addChild(this.doorGroup);
        this.container.addChild(this.timerText);

        this.leftHitArea = new PIXI.Graphics();
        this.leftHitArea.beginFill(0xff0000, 0.001);
        this.leftHitArea.drawRect(0, 0, 100, 100);
        this.leftHitArea.endFill();
        this.leftHitArea.eventMode = 'static';
        this.leftHitArea.cursor = 'pointer';
        this.leftHitArea.on('pointerdown', () => this.handleInteraction('CCW'));

        this.rightHitArea = new PIXI.Graphics();
        this.rightHitArea.beginFill(0x0000ff, 0.001);
        this.rightHitArea.drawRect(0, 0, 100, 100);
        this.rightHitArea.endFill();
        this.rightHitArea.eventMode = 'static';
        this.rightHitArea.cursor = 'pointer';
        this.rightHitArea.on('pointerdown', () => this.handleInteraction('CW'));

        this.app.stage.addChild(this.leftHitArea);
        this.app.stage.addChild(this.rightHitArea);
    }

    public resize() {
        const { width, height } = this.app.screen;

        this.container.x = width / 2;
        this.container.y = height / 2;


        const scale = Math.max(width / 2400, height / 1108);
        this.container.scale.set(scale);


        this.timerText.x = -456;
        this.timerText.y = -70;


        this.leftHitArea.width = width / 2;
        this.leftHitArea.height = height;
        this.leftHitArea.x = 0;
        this.leftHitArea.y = 0;

        this.rightHitArea.width = width / 2;
        this.rightHitArea.height = height;
        this.rightHitArea.x = width / 2;
        this.rightHitArea.y = 0;
    }

    public setTimerText(text: string) {
        this.timerText.text = text;
    }

    private handleInteraction(dir: Direction) {
        if (this.onInteraction) {
            this.onInteraction(dir);
        }
    }

    public async rotateHandle(dir: Direction) {
        this.isAnimating = true;
        const angle = dir === 'CW' ? Math.PI / 3 : -Math.PI / 3;

        return new Promise<void>((resolve) => {
            gsap.to([this.handle, this.handleShadow], {
                rotation: `+=${angle}`,
                duration: 0.3,
                ease: "back.out(1.7)",
                onComplete: () => {
                    this.isAnimating = false;
                    resolve();
                }
            });
        });
    }

    public async playErrorAnimation() {
        this.isAnimating = true;

        return new Promise<void>((resolve) => {
            gsap.to([this.handle, this.handleShadow], {
                rotation: "+=" + (Math.PI * 6),
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: () => {
                    this.isAnimating = false;
                    resolve();
                }
            });
        });
    }

    public async playSuccessAnimation() {
        this.isAnimating = true;
        const halfDoorW = this.doorClosed.texture.width / 2;

        return new Promise<void>((resolve) => {
            // Prepare the side-view door sprite (starts invisible)
            this.doorOpen.visible = true;
            this.doorOpen.alpha = 0;

            const tl = gsap.timeline({
                onComplete: () => {
                    this.playShineAnimation();
                    resolve();
                }
            });

            //  Swing the closed-door panel: compress scaleX toward the right-edge pivot
            tl.to(this.doorPanel.scale, {
                x: 0,
                duration: 1.2,
                ease: "power3.inOut"
            }, 0);

            // Shift the hinge point rightward as the door swings out
            tl.to(this.doorPanel, {
                x: halfDoorW + 20,
                duration: 1.2,
                ease: "power3.inOut"
            }, 0);

            // hide the flat panel, reveal the pre-rendered side-view
            tl.to(this.doorOpen, {
                alpha: 1,
                duration: 0.6,
                ease: "power1.in"
            }, 0.6);
        });
    }

    private playShineAnimation() {
        this.shine.visible = true;
        this.shine.alpha = 0;
        this.shine.rotation = 0;


        this.shine.scale.set(0.8);

        gsap.to(this.shine, {
            rotation: Math.PI * 2,
            duration: 5,
            repeat: -1,
            ease: "none"
        });

        gsap.to(this.shine, {
            alpha: 1,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }

    public async closeVault() {
        const halfDoorW = this.doorClosed.texture.width / 2;

        return new Promise<void>((resolve) => {
            gsap.killTweensOf(this.shine);
            this.shine.visible = false;

            const tl = gsap.timeline({
                onComplete: () => {
                    this.doorOpen.visible = false;
                    this.isAnimating = false;
                    resolve();
                }
            });

            //  Fade out the side-view door sprite
            tl.to(this.doorOpen, {
                alpha: 0,
                duration: 0.5,
                ease: "power1.out"
            }, 0);

            //  Swing the panel closed — restore scaleX from 0 to 1
            tl.to(this.doorPanel.scale, {
                x: 1,
                duration: 1.2,
                ease: "power3.inOut"
            }, 0.3);

            // Move panel back to its neutral position
            tl.to(this.doorPanel, {
                x: halfDoorW,
                duration: 1.2,
                ease: "power3.inOut"
            }, 0.3);
        });
    }
}
