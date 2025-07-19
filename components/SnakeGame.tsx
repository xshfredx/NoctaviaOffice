import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const SNAKE_START = [{ x: 8, y: 10 }, { x: 7, y: 10 }];
const FOOD_START = { x: 5, y: 5 };
const SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [snake, setSnake] = useState<Point[]>(SNAKE_START);
    const [food, setFood] = useState<Point>(FOOD_START);
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [speed, setSpeed] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const createFood = useCallback((snakeBody: Point[]): Point => {
        let newFood: Point;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }, []);

    const startGame = useCallback(() => {
        const startSnake = [{ x: 8, y: 10 }, { x: 7, y: 10 }];
        setSnake(startSnake);
        setFood(createFood(startSnake));
        setDirection('RIGHT');
        setSpeed(SPEED);
        setGameOver(false);
        setScore(0);
    }, [createFood]);

    const moveSnake = useCallback((dir: Direction, snk: Point[]) => {
        const newSnake = [...snk];
        const head = { ...newSnake[0] };

        switch (dir) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
        }
        newSnake.unshift(head);
        return newSnake;
    }, []);

    const checkCollision = (head: Point, snk: Point[]) => {
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return true;
        }
        for (const segment of snk.slice(1)) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
                case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
                case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
                case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
                case ' ': case 'Enter': if (gameOver || speed === null) startGame(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction, gameOver, speed, startGame]);

    useEffect(() => {
        if (speed === null || gameOver) {
            return;
        }

        const gameInterval = setInterval(() => {
            setSnake(prevSnake => {
                const newSnake = moveSnake(direction, prevSnake);
                const head = newSnake[0];

                if (checkCollision(head, newSnake)) {
                    setGameOver(true);
                    setSpeed(null);
                    return prevSnake;
                }

                if (head.x === food.x && head.y === food.y) {
                    setFood(createFood(newSnake));
                    setScore(s => s + 10);
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, speed);
        return () => clearInterval(gameInterval);
    }, [direction, food, speed, gameOver, moveSnake, createFood]);

    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');
        if (!context) return;
        
        context.fillStyle = '#0c0c0c';
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        context.strokeStyle = 'rgba(249, 115, 22, 0.1)'; // orange-500 with opacity
        for (let i = 1; i < GRID_SIZE; i++) {
            context.beginPath();
            context.moveTo(i * CELL_SIZE, 0);
            context.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            context.stroke();
            context.beginPath();
            context.moveTo(0, i * CELL_SIZE);
            context.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            context.stroke();
        }

        snake.forEach((segment, index) => {
            context.fillStyle = index === 0 ? '#fb923c' : '#f97316'; // orange-400 for head, orange-500 for body
            context.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });

        context.fillStyle = '#a3e635'; // lime-400
        context.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE / 3, CELL_SIZE / 3);


    }, [snake, food]);

    return (
        <div className="w-full h-full p-4 flex flex-col items-center bg-black text-orange-500">
            <div className="w-full flex justify-between items-center mb-2 px-2">
                <h2 className="text-xl text-glow uppercase">Score: {score}</h2>
            </div>
            <div className="relative border-2 border-orange-500">
                <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
                {(gameOver || speed === null) &&
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-center p-4">
                        <h2 className="text-4xl text-red-500 font-bold text-glow">{gameOver ? "Game Over" : "Snake"}</h2>
                        <button onClick={startGame} className="mt-4 px-4 py-2 bg-black text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-200 uppercase text-lg text-glow">
                            {gameOver ? "Play Again" : "Start Game"}
                        </button>
                        <p className="mt-4 text-sm text-gray-400">Use Arrow Keys to Move</p>
                    </div>
                }
            </div>
        </div>
    );
};

export default SnakeGame;
