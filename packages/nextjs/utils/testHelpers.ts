/**
 * Test Helpers for BrainD Games
 *
 * Utilities for testing game randomness, fairness, and functionality
 */

/**
 * Test Color Match randomness
 */
export function testColorMatchRandomness(matchProbability: number, iterations: number = 100) {
  const { generateWord } = require('../games/colormatch/utils/gameLogic');

  const results = Array.from({ length: iterations }, () => generateWord(matchProbability));

  const matches = results.filter(w =>
    w.text.toLowerCase() === w.color.toLowerCase().replace('#', '').substring(0,
      w.text.length
    )
  ).length;

  const actualPercentage = (matches / iterations) * 100;
  const expectedPercentage = matchProbability * 100;
  const variance = Math.abs(actualPercentage - expectedPercentage);

  console.log('🎮 Color Match Randomness Test');
  console.log('━'.repeat(50));
  console.log(`Iterations: ${iterations}`);
  console.log(`Expected match rate: ${expectedPercentage}%`);
  console.log(`Actual match rate: ${actualPercentage.toFixed(2)}%`);
  console.log(`Variance: ${variance.toFixed(2)}%`);
  console.log(`Status: ${variance < 15 ? '✅ PASS' : '⚠️  HIGH VARIANCE'}`);
  console.log('━'.repeat(50));

  return {
    matches,
    total: iterations,
    percentage: actualPercentage,
    expected: expectedPercentage,
    variance,
    pass: variance < 15
  };
}

/**
 * Test Speed Match randomness
 */
export function testSpeedMatchRandomness(matchProbability: number, iterations: number = 100) {
  const { generateNextShape } = require('../games/speed-match/utils/gameLogic');

  const shapes: any[] = [];
  for (let i = 0; i < iterations; i++) {
    const prevShape = i === 0 ? null : shapes[i - 1];
    shapes.push(generateNextShape(prevShape, matchProbability));
  }

  let consecutiveMatches = 0;
  for (let i = 1; i < shapes.length; i++) {
    if (shapes[i].type === shapes[i-1].type && shapes[i].color === shapes[i-1].color) {
      consecutiveMatches++;
    }
  }

  const actualPercentage = (consecutiveMatches / (iterations - 1)) * 100;
  const expectedPercentage = matchProbability * 100;
  const variance = Math.abs(actualPercentage - expectedPercentage);

  console.log('⚡ Speed Match Randomness Test');
  console.log('━'.repeat(50));
  console.log(`Iterations: ${iterations}`);
  console.log(`Expected match rate: ${expectedPercentage}%`);
  console.log(`Actual match rate: ${actualPercentage.toFixed(2)}%`);
  console.log(`Variance: ${variance.toFixed(2)}%`);
  console.log(`Status: ${variance < 15 ? '✅ PASS' : '⚠️  HIGH VARIANCE'}`);
  console.log('━'.repeat(50));

  return {
    matches: consecutiveMatches,
    total: iterations - 1,
    percentage: actualPercentage,
    expected: expectedPercentage,
    variance,
    pass: variance < 15
  };
}

/**
 * Test score calculation fairness
 */
export function testScoreCalculation() {
  const { calculateScore } = require('../games/colormatch/utils/gameLogic');

  console.log('💯 Score Calculation Test');
  console.log('━'.repeat(50));

  const tests = [
    { score: 0, correct: true, expected: 100 },
    { score: 100, correct: true, expected: 200 },
    { score: 100, correct: false, expected: 75 },
    { score: 50, correct: false, expected: 25 },
    { score: 20, correct: false, expected: 0 }, // Min score
  ];

  let passed = 0;
  tests.forEach((test, i) => {
    const result = calculateScore(test.score, test.correct);
    const pass = result === test.expected;
    console.log(`Test ${i + 1}: ${pass ? '✅' : '❌'} Score ${test.score} + ${test.correct ? 'correct' : 'wrong'} = ${result} (expected ${test.expected})`);
    if (pass) passed++;
  });

  console.log('━'.repeat(50));
  console.log(`Results: ${passed}/${tests.length} tests passed`);
  console.log('━'.repeat(50));

  return {
    passed,
    total: tests.length,
    allPass: passed === tests.length
  };
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('\n🚀 Running All Game Tests\n');

  const results = {
    colorMatchEasy: testColorMatchRandomness(0.7, 200),
    colorMatchMedium: testColorMatchRandomness(0.5, 200),
    colorMatchHard: testColorMatchRandomness(0.3, 200),
    speedMatchEasy: testSpeedMatchRandomness(0.7, 200),
    speedMatchMedium: testSpeedMatchRandomness(0.5, 200),
    speedMatchHard: testSpeedMatchRandomness(0.3, 200),
    scoreCalculation: testScoreCalculation(),
  };

  console.log('\n📊 Test Summary');
  console.log('━'.repeat(50));

  const allPassed = Object.values(results).every(r =>
    'pass' in r ? r.pass : r.allPass
  );

  console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
  console.log('━'.repeat(50));

  return results;
}

/**
 * Simulate game session
 */
export function simulateGameSession(gameName: 'colormatch' | 'speedmatch', difficulty: 'easy' | 'medium' | 'hard') {
  console.log(`\n🎮 Simulating ${gameName} session (${difficulty})\n`);

  const probabilities = {
    easy: 0.7,
    medium: 0.5,
    hard: 0.3
  };

  const matchProb = probabilities[difficulty];
  const rounds = 10;

  if (gameName === 'colormatch') {
    const { generateWord, calculateScore } = require('../games/colormatch/utils/gameLogic');

    let score = 0;
    let correct = 0;

    for (let i = 0; i < rounds; i++) {
      const word = generateWord(matchProb);
      const isMatch = word.text.toLowerCase() === word.color.toLowerCase();
      const userGuess = Math.random() < 0.7; // Simulate 70% accuracy
      const isCorrect = isMatch === userGuess;

      score = calculateScore(score, isCorrect);
      if (isCorrect) correct++;

      console.log(`Round ${i + 1}: ${word.text} in ${word.color} - ${isMatch ? 'Match' : 'No match'} - Guess: ${userGuess ? 'Match' : 'No match'} - ${isCorrect ? '✅' : '❌'} Score: ${score}`);
    }

    console.log(`\nFinal Score: ${score}`);
    console.log(`Accuracy: ${(correct / rounds * 100).toFixed(0)}%`);
  }
}

// Browser-friendly export
if (typeof window !== 'undefined') {
  (window as any).testHelpers = {
    testColorMatchRandomness,
    testSpeedMatchRandomness,
    testScoreCalculation,
    runAllTests,
    simulateGameSession,
  };

  console.log('🧪 Test helpers loaded! Try:');
  console.log('  testHelpers.runAllTests()');
  console.log('  testHelpers.simulateGameSession("colormatch", "medium")');
}
