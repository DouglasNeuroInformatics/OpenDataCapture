import { useEffect, useState } from '/runtime/v1/react@18.x';

const colors = ['red', 'blue', 'green', 'yellow'];
const words = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

type StroopTaskProps = {
  done: (data: { score: number }) => void;
};

export const StroopTask: React.FC<StroopTaskProps> = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds for the task

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      generateNewTask();
    }
  }, [timeLeft]);

  const generateNewTask = () => {
    const word = getRandomElement(words);
    const color = getRandomElement(colors);
    setCurrentWord(word);
    setCurrentColor(color);
  };

  const handleColorClick = (color: string) => {
    if (color === currentColor) {
      setScore(score + 1);
    }
    generateNewTask();
  };

  return (
    <div>
      <h1>Stroop Task</h1>
      <div>
        <h2>Time Left: {timeLeft} seconds</h2>
        <h2>Score: {score}</h2>
      </div>
      {timeLeft > 0 ? (
        <div>
          <h2 style={{ color: currentColor }}>{currentWord}</h2>
          <div>
            {colors.map((color) => (
              <button
                key={color}
                style={{ backgroundColor: color, color: 'white', margin: '5px', padding: '10px' }}
                onClick={() => handleColorClick(color)}
              >
                {color.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <h2>Time is up! Your final score is {score}</h2>
      )}
    </div>
  );
};
