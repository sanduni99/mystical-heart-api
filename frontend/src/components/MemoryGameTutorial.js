import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

export default function MemoryGameTutorial({ user, onComplete, onSkip }) {
  const [gameState, setGameState] = useState('intro'); // intro, memorizing, answering, result, complete
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [playerAnswer, setPlayerAnswer] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [timer, setTimer] = useState(10);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalRounds] = useState(5);

  const symbols = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🧪', '⚗️', '🔮', '💎', '🌟', '⚡'];

  // Start new round
  const startRound = () => {
    // Generate sequence (length increases each round)
    const length = Math.min(3 + round, 6); // Start with 4, max 6
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    
    setSequence(newSequence);
    setPlayerAnswer([]);
    setShowSequence(true);
    setTimer(10);
    setGameState('memorizing');
  };

  // Timer for memorizing phase
  useEffect(() => {
    if (gameState === 'memorizing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            setShowSequence(false);
            setGameState('answering');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, timer]);

  // Handle symbol click
  const handleSymbolClick = (symbol) => {
    if (gameState !== 'answering') return;
    
    const newAnswer = [...playerAnswer, symbol];
    setPlayerAnswer(newAnswer);

    // Check if answer is correct so far
    const isCorrectSoFar = sequence[newAnswer.length - 1] === symbol;
    
    if (!isCorrectSoFar) {
      // Wrong answer
      setLives(lives - 1);
      
      if (lives - 1 <= 0) {
        // Game over
        setGameState('complete');
      } else {
        // Try again
        setGameState('result');
        setTimeout(() => startRound(), 2000);
      }
    } else if (newAnswer.length === sequence.length) {
      // Complete sequence correct!
      const points = sequence.length * 10;
      setScore(score + points);
      setGameState('result');
      
      if (round >= totalRounds) {
        // Tutorial complete
        setTimeout(() => setGameState('complete'), 2000);
      } else {
        // Next round
        setTimeout(() => {
          setRound(round + 1);
          startRound();
        }, 2000);
      }
    }
  };

  // Clear answer
  const clearAnswer = () => {
    setPlayerAnswer([]);
  };

  // Handle completion
  const handleComplete = () => {
    onComplete({
      score,
      rounds: round,
      tutorialCompleted: true,
      xpEarned: 50,
      goldEarned: 100
    });
  };

  // Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-full max-w-2xl p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          <div className="text-center">
            <Brain className="w-20 h-20 mx-auto mb-6 text-purple-400 animate-pulse" />
            <h1 className="mb-4 text-4xl font-bold text-white">
              🎓 Initiation Trial
            </h1>
            <p className="mb-6 text-xl text-gray-300">
              Welcome to the Alchemist Academy, {user.avatar} {user.username}!
            </p>

            <div className="p-6 mb-6 text-left bg-white bg-opacity-10 rounded-2xl">
              <h3 className="mb-4 text-xl font-bold text-yellow-400">How to Play:</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <p>Watch the sequence of symbols carefully</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <p>After 3 seconds, the symbols will disappear</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <p>Click the symbols in the SAME ORDER you saw them</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">4️⃣</span>
                  <p>Complete 5 rounds to pass the trial!</p>
                </div>
              </div>
            </div>

            <div className="p-4 mb-6 bg-yellow-400 bg-opacity-20 rounded-xl">
              <p className="font-semibold text-yellow-300">
                ⚠️ You have 3 lives. Each mistake costs 1 life!
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startRound}
                className="flex-1 py-4 font-bold text-white transition-all transform bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:from-purple-600 hover:to-pink-700 hover:scale-105"
              >
                Start Trial
              </button>
              <button
                onClick={onSkip}
                className="px-6 font-bold text-white transition-all bg-gray-600 rounded-xl hover:bg-gray-700"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Memorizing Phase
  if (gameState === 'memorizing') {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-full max-w-4xl p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Round {round}/{totalRounds}</h2>
              <p className="text-gray-300">Score: {score}</p>
            </div>
            <div className="flex gap-2">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${i < lives ? 'bg-red-500' : 'bg-gray-600'}`}>
                  {i < lives && '❤️'}
                </div>
              ))}
            </div>
          </div>

          {/* Instruction */}
          <div className="mb-8 text-center">
            <h3 className="mb-4 text-3xl font-bold text-yellow-400 animate-pulse">
              Memorize the Sequence!
            </h3>
            <div className="text-6xl font-bold text-white">
              {timer}
            </div>
          </div>

          {/* Sequence Display */}
          <div className="p-8 mb-6 bg-white bg-opacity-10 rounded-2xl">
            <div className="flex flex-wrap justify-center gap-4">
              {showSequence && sequence.map((symbol, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center w-20 h-20 text-4xl transition-all transform bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl hover:scale-110 animate-bounce"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-gray-400">
            Sequence length: {sequence.length} symbols
          </div>
        </div>
      </div>
    );
  }

  // Answering Phase
  if (gameState === 'answering') {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-full max-w-4xl p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Round {round}/{totalRounds}</h2>
              <p className="text-gray-300">Score: {score}</p>
            </div>
            <div className="flex gap-2">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${i < lives ? 'bg-red-500' : 'bg-gray-600'}`}>
                  {i < lives && '❤️'}
                </div>
              ))}
            </div>
          </div>

          {/* Instruction */}
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-3xl font-bold text-green-400">
              Click the Sequence!
            </h3>
            <p className="text-gray-300">Click symbols in the order you saw them</p>
          </div>

          {/* Player Answer */}
          <div className="p-6 mb-6 bg-white bg-opacity-10 rounded-2xl">
            <h4 className="mb-4 font-bold text-center text-white">Your Answer ({playerAnswer.length}/{sequence.length}):</h4>
            <div className="flex justify-center gap-3 flex-wrap min-h-[100px]">
              {playerAnswer.map((symbol, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center w-16 h-16 text-3xl bg-green-500 border-2 border-green-400 bg-opacity-30 rounded-xl"
                >
                  {symbol}
                </div>
              ))}
            </div>
            {playerAnswer.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={clearAnswer}
                  className="px-6 py-2 text-white transition-all bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Symbol Grid */}
          <div className="p-6 bg-white bg-opacity-10 rounded-2xl">
            <h4 className="mb-4 font-bold text-center text-white">Select Symbols:</h4>
            <div className="grid grid-cols-6 gap-3">
              {symbols.map((symbol, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSymbolClick(symbol)}
                  className="flex items-center justify-center w-full text-3xl transition-all transform aspect-square bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl hover:from-blue-600 hover:to-cyan-700 hover:scale-110"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Phase
  if (gameState === 'result') {
    const isCorrect = playerAnswer.length === sequence.length && 
                      playerAnswer.every((sym, idx) => sym === sequence[idx]);
    
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-full max-w-2xl p-8 text-center bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          <div className="mb-6 text-8xl">
            {isCorrect ? '🎉' : '❌'}
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? 'Perfect!' : 'Wrong Answer!'}
          </h2>
          <p className="mb-6 text-xl text-gray-300">
            {isCorrect 
              ? `+${sequence.length * 10} points!` 
              : `Lives remaining: ${lives}`
            }
          </p>
          <div className="text-gray-400">
            {isCorrect ? 'Next round starting...' : 'Try again...'}
          </div>
        </div>
      </div>
    );
  }

  // Complete Screen
  if (gameState === 'complete') {
    const passed = lives > 0 && round >= totalRounds;
    
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-full max-w-2xl p-8 text-center bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          <div className="mb-6 text-8xl">
            {passed ? '🏆' : '💀'}
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${passed ? 'text-yellow-400' : 'text-red-400'}`}>
            {passed ? 'Trial Complete!' : 'Trial Failed'}
          </h2>
          
          {passed ? (
            <>
              <p className="mb-8 text-xl text-gray-300">
                Congratulations! You've proven your memory skills!
              </p>

              <div className="p-6 mb-8 bg-white bg-opacity-10 rounded-2xl">
                <h3 className="mb-4 text-2xl font-bold text-white">Results:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500 bg-opacity-20 rounded-xl">
                    <div className="text-3xl font-bold text-blue-400">{score}</div>
                    <div className="text-gray-300">Score</div>
                  </div>
                  <div className="p-4 bg-green-500 bg-opacity-20 rounded-xl">
                    <div className="text-3xl font-bold text-green-400">{round}/{totalRounds}</div>
                    <div className="text-gray-300">Rounds</div>
                  </div>
                </div>
              </div>

              <div className="p-6 mb-8 bg-yellow-400 bg-opacity-20 rounded-xl">
                <h3 className="mb-3 text-xl font-bold text-yellow-400">Rewards Unlocked:</h3>
                <div className="space-y-2 text-gray-300">
                  <div>✅ Heart Alchemy Laboratory</div>
                  <div>✅ +50 Experience Points</div>
                  <div>✅ +100 Starting Gold</div>
                  <div>✅ Achievement: "Memory Master"</div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-4 text-xl font-bold text-white transition-all transform bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 hover:scale-105"
              >
                Enter Main Game
              </button>
            </>
          ) : (
            <>
              <p className="mb-8 text-xl text-gray-300">
                You ran out of lives. Try again to prove your skills!
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setRound(1);
                    setScore(0);
                    setLives(3);
                    setGameState('intro');
                  }}
                  className="w-full py-4 font-bold text-white transition-all bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl hover:from-blue-600 hover:to-cyan-700"
                >
                  Try Again
                </button>
                <button
                  onClick={onSkip}
                  className="w-full py-4 font-bold text-white transition-all bg-gray-600 rounded-xl hover:bg-gray-700"
                >
                  Skip Tutorial
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}


