import React, { useState } from 'react';

const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

    const buttonStyle = "bg-black border border-orange-500 text-orange-500 text-2xl text-glow hover:bg-orange-500 hover:text-black focus:outline-none focus:bg-orange-500 transition-colors duration-150";
    const operatorStyle = "bg-orange-900 border border-orange-500 text-orange-400 text-2xl text-glow hover:bg-orange-500 hover:text-black focus:outline-none focus:bg-orange-500 transition-colors duration-150";

    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplay(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForSecondOperand) {
            setDisplay('0.');
            setWaitingForSecondOperand(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clearDisplay = () => {
        setDisplay('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            setDisplay(String(result));
            setFirstOperand(result);
        }
        
        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    };
    
    const calculate = (first: number, second: number, op: string): number => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return second === 0 ? Infinity : first / second;
            default: return second;
        }
    };
    
    const handleEquals = () => {
        const inputValue = parseFloat(display);
        if (operator && firstOperand !== null) {
            const result = calculate(firstOperand, inputValue, operator);
            setDisplay(String(result));
            setFirstOperand(null); // Reset for new calculations
            setOperator(null);
            setWaitingForSecondOperand(true);
        }
    }

    return (
        <div className="w-full h-full p-4 flex flex-col bg-black">
            <div className="w-full bg-black border-2 border-orange-500 text-orange-500 text-right text-4xl p-4 mb-4 text-glow overflow-x-auto">
                {display}
            </div>
            <div className="grid grid-cols-4 gap-2 flex-grow">
                <button onClick={clearDisplay} className={operatorStyle}>C</button>
                <button onClick={() => performOperation('/')} className={operatorStyle}>÷</button>
                <button onClick={() => performOperation('*')} className={operatorStyle}>×</button>
                <button onClick={() => performOperation('-')} className={operatorStyle}>−</button>

                <button onClick={() => inputDigit('7')} className={buttonStyle}>7</button>
                <button onClick={() => inputDigit('8')} className={buttonStyle}>8</button>
                <button onClick={() => inputDigit('9')} className={buttonStyle}>9</button>
                <button onClick={() => performOperation('+')} className={`${operatorStyle} row-span-2`}>+</button>

                <button onClick={() => inputDigit('4')} className={buttonStyle}>4</button>
                <button onClick={() => inputDigit('5')} className={buttonStyle}>5</button>
                <button onClick={() => inputDigit('6')} className={buttonStyle}>6</button>

                <button onClick={() => inputDigit('1')} className={buttonStyle}>1</button>
                <button onClick={() => inputDigit('2')} className={buttonStyle}>2</button>
                <button onClick={() => inputDigit('3')} className={buttonStyle}>3</button>
                <button onClick={handleEquals} className={`${operatorStyle} row-span-2`}>=</button>

                <button onClick={() => inputDigit('0')} className={`${buttonStyle} col-span-2`}>0</button>
                <button onClick={inputDecimal} className={buttonStyle}>.</button>
            </div>
        </div>
    );
};

export default Calculator;
