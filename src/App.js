import { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import './App.css';

const buttons = [
  '(', ')', 'C', 'Backspace',
  'sin', 'cos', 'tan', '/',
  'asin', 'acos', 'atan', '*',
  'log', 'ln', '^', '-',
  '7', '8', '9', '+',
  '4', '5', '6', 'π',
  '1', '2', '3', 'e',
  '0', '.', '=', '√'
];

const validOperators = ['+', '-', '*', '/', '^'];

function App() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [activeBtn, setActiveBtn] = useState(null);

  const appendInput = (value) => {
    setError('');
    if (validOperators.includes(value) || value === '^') {
      if (input === '' && value !== '-') {
        setError('Expression cannot start with operator');
        return;
      }
      if (validOperators.includes(input.slice(-1)) || input.slice(-1) === '^') {
        setError('Two operators cannot be consecutive');
        return;
      }
    }

    if (value === ')') {
      const openParens = (input.match(/\(/g) || []).length;
      const closeParens = (input.match(/\)/g) || []).length;
      if (closeParens >= openParens) {
        setError('No matching open parenthesis');
        return;
      }
      if (validOperators.includes(input.slice(-1))) {
        setError('Operator before closing parenthesis not allowed');
        return;
      }
    }

    const functionsWithParen = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', '√'];
    if (functionsWithParen.includes(value)) {
      setInput(prev => prev + value + '(');
      return;
    }

    setInput(prev => prev + value);
  };

  const handleEqual = () => {
    try {
      const openParens = (input.match(/\(/g) || []).length;
      const closeParens = (input.match(/\)/g) || []).length;
      let expression = input;

      if (openParens > closeParens) {
        expression += ')'.repeat(openParens - closeParens);
      }

      let expr = expression
          .replace(/π/g, 'pi')
          .replace(/√/g, 'sqrt')
          .replace(/ln/g, 'log')
          .replace(/\^/g, '**')
          .replace(/\s+/g, '');

      const result = evaluate(expr);
      setInput(result.toString());
      setError('');
      setHistory(prev => [...prev, { expression, result: result.toString() }]);
    } catch (e) {
      setError('Invalid expression: ' + e.message);
    }
  };

  const handleClear = () => {
    setInput('');
    setError('');
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
    setError('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;

      let btn = null;

      if (key === 'Enter') {
        handleEqual();
        btn = '=';
      } else if (key === 'Backspace') {
        handleBackspace();
        btn = 'Backspace';
      } else if (key === 'Delete') {
        handleClear();
        btn = 'C';
      } else if (key === 'Escape') {
        handleClear();
        btn = 'C';
      } else if (key === ' ') {
        e.preventDefault();
      } else {
        if (/[0-9+\-*/().^]/.test(key)) {
          appendInput(key);
          btn = key;
        } else if (key === ',') {
          appendInput('.');
          btn = '.';
        }
      }

      if (btn) {
        setActiveBtn(btn);
        setTimeout(() => setActiveBtn(null), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  return (
      <div className="calculator">
        <h2>Scientific Calculator</h2>
        <input type="text" value={input} readOnly className="display" />
        {error && <div className="error">{error}</div>}
        <div className="buttons">
          {buttons.map(btn => (
              <button
                  key={btn}
                  onClick={() => {
                    if (btn === 'Backspace') handleBackspace();
                    else if (btn === 'C') handleClear();
                    else if (btn === '=') handleEqual();
                    else appendInput(btn);
                    setActiveBtn(btn);
                    setTimeout(() => setActiveBtn(null), 150);
                  }}
                  className={`button ${activeBtn === btn ? 'active' : ''}`}
              >
                {btn === 'Backspace' ? '⌫' : btn}
              </button>
          ))}
        </div>

        <div className="history">
          <h3>History</h3>
          {history.length === 0 && <p>No history yet.</p>}
          <ul>
            {history.map((item, index) => (
                <li key={index} onClick={() => setInput(item.expression)}>
                  {item.expression} = {item.result}
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}

export default App;
