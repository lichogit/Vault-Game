export type Direction = "CW" | "CCW";
export type CodeStep = { number: number; direction: Direction };

export class VaultLogic {
    public steps: CodeStep[] = [];
    private currentStepIndex: number = 0;
    private currentDirection: Direction | null = null;
    private currentClicks: number = 0;

    public generateCode() {
        this.steps = [];
        let dir: Direction = Math.random() > 0.5 ? "CW" : "CCW";
        for (let i = 0; i < 3; i++) {
            this.steps.push({
                number: Math.floor(Math.random() * 9) + 1, // 1 to 9
                direction: dir
            });
            dir = dir === "CW" ? "CCW" : "CW";
        }
        
        console.log("%cSECRET CODE:", "color: lime; font-weight: bold; font-size: 16px;");
        console.log("%c" + this.steps.map(s => `${s.number} ${s.direction}`).join(', '), "color: cyan; font-size: 14px;");
        
        this.currentStepIndex = 0;
        this.currentDirection = null;
        this.currentClicks = 0;
    }

    public handleInput(dir: Direction): "SUCCESS" | "ERROR" | "CONTINUE" {
        if (this.currentDirection === null) {
            this.currentDirection = dir;
        }

        if (this.currentDirection !== dir) {
            const expectedStep = this.steps[this.currentStepIndex];
            if (this.currentClicks === expectedStep.number && this.currentDirection === expectedStep.direction) {
                this.currentStepIndex++;
                this.currentDirection = dir;
                this.currentClicks = 1;
            } else {
                return "ERROR";
            }
        } else {
            this.currentClicks++;
        }

        const expectedStep = this.steps[this.currentStepIndex];
        if (this.currentDirection !== expectedStep.direction) {
            return "ERROR";
        }

        if (this.currentClicks > expectedStep.number) {
            return "ERROR";
        }

        if (this.currentStepIndex === this.steps.length - 1) {
            if (this.currentClicks === expectedStep.number && this.currentDirection === expectedStep.direction) {
                return "SUCCESS";
            }
        }

        return "CONTINUE";
    }
}
