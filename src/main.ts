import { Game } from './Game';

const init = async () => {
    const game = new Game();
    await game.init();
};

init();
