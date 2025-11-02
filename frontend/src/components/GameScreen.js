import React, { useState, useEffect } from 'react';
import bgImage from '../assets/images/bg_2.png';

export default function GameScreen({ user, onGameEnd, onBack }) {
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [goldEarned, setGoldEarned] = useState(0);
  const [gameStartTime] = useState(Date.now());

  useEffect(() => {
    loadNewPuzzle();
  }, []);

  const loadNewPuzzle = async () => {
    setLoading(true);
    setFeedback('');
    setAnswer('');
    
    try {
      // ✅ CORRECT - Use backend proxy
      const response = await fetch('http://localhost:5000/api/puzzle');
      const data = await response.json();
      setPuzzle(data);
    } catch (error) {
      setFeedback('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!answer || !puzzle) return;

    const userAnswer = parseInt(answer);
    const correctAnswer = puzzle.solution;

    if (userAnswer === correctAnswer) {
      const points = 50;
      const gold = 25;
      setScore(prev => prev + points);
      setGoldEarned(prev => prev + gold);
      setQuestsCompleted(prev => prev + 1);
      setFeedback(`✅ Correct! +${points} points, +${gold} gold`);
      
      setTimeout(() => {
        loadNewPuzzle();
      }, 1500);
    } else {
      setLives(prev => prev - 1);
      setFeedback(`❌ Wrong! The answer was ${correctAnswer}. Lives: ${lives - 1}`);
      
      if (lives - 1 <= 0) {
        setTimeout(() => {
          endGame(false);
        }, 2000);
      } else {
        setTimeout(() => {
          loadNewPuzzle();
        }, 2000);
      }
    }
  };

 const endGame = (survived) => {
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    let level = 'Apprentice';
    if (score >= 300) {
        level = 'Master';
    } else if (score >= 150) {
        level = 'Expert';
    } else if (score >= 50) {
        level = 'Advanced';
    }
    
    onGameEnd({
      score,
      level,
      recipesDiscovered: 0,
      questsCompleted,
      goldEarned,
      duration,
      survived,
      livesRemaining: lives
    });
};

  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white hover:text-gray-300">
            ← Back
          </button>
          <div className="flex gap-4 text-white">
            <div className="px-4 py-2 bg-white rounded-lg bg-opacity-20">
              ❤️ Lives: {lives}
            </div>
            <div className="px-4 py-2 bg-white rounded-lg bg-opacity-20">
              ⭐ Score: {score}
            </div>
            <div className="px-4 py-2 bg-white rounded-lg bg-opacity-20">
              💰 Gold: {goldEarned}
            </div>
          </div>
        </div>

        {/* Game Card */}
        <div className="p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-4xl font-bold text-white">🧪 Alchemy Puzzle</h2>
            <p className="text-gray-300">Solve the mystical equation!</p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-white">
              <div className="mb-4 text-6xl animate-bounce">🔮</div>
              <p>Loading puzzle...</p>
            </div>
          ) : puzzle ? (
            <div className="space-y-6">
              {/* Puzzle Image */}
              <div className="flex items-center justify-center p-6 bg-white rounded-2xl">
                <img 
                  src={puzzle.question} 
                  alt="Puzzle" 
                  className="max-w-full max-h-96"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`p-4 rounded-xl text-center font-bold text-lg ${
                  feedback.includes('✅') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {feedback}
                </div>
              )}

              {/* Answer Input */}
              <div className="flex gap-3">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your answer..."
                  disabled={!!feedback}
                  className="flex-1 px-6 py-4 text-xl text-center text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-yellow-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!answer || !!feedback}
                  className="px-8 py-4 text-xl font-bold text-white transition-all transform bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Submit
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
                  <div className="mb-1 text-2xl">🎯</div>
                  <div className="text-sm text-gray-300">Quests</div>
                  <div className="text-2xl font-bold text-white">{questsCompleted}</div>
                </div>
                <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
                  <div className="mb-1 text-2xl">⚡</div>
                  <div className="text-sm text-gray-300">Streak</div>
                  <div className="text-2xl font-bold text-yellow-400">{questsCompleted}</div>
                </div>
                <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
                  <div className="mb-1 text-2xl">👤</div>
                  <div className="text-sm text-gray-300">Player</div>
                  <div className="text-2xl">{user.avatar}</div>
                </div>
              </div>

              {/* End Game Button */}
              <button
                onClick={() => endGame(true)}
                className="w-full py-3 text-white transition-all bg-gray-600 rounded-xl hover:bg-gray-700"
              >
                End Game
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-white">
              <p>Failed to load puzzle</p>
              <button
                onClick={loadNewPuzzle}
                className="px-6 py-3 mt-4 font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}