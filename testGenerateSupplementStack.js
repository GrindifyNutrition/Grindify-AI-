const generateSupplementStack = require('./generateSupplementStack');

describe('generateSupplementStack', () => {
  test('should include basic supplements for everyone', () => {
    const userProfile = {
      goal: 'general health',
      age: 25,
      weight: 150,
      height: "5'10",
      experience: 'Beginner'
    };

    const result = generateSupplementStack(userProfile);
    expect(result.stack).toBeDefined();
    expect(result.stack.some(s => s.name === 'Advanced Multivitamin')).toBe(true);
  });

  test('should include muscle-building supplements for strength goals', () => {
    const userProfile = {
      goal: 'build muscle',
      age: 25,
      weight: 150,
      height: "5'10",
      experience: 'Intermediate'
    };

    const result = generateSupplementStack(userProfile);
    expect(result.stack.some(s => s.name === 'Creatine Monohydrate')).toBe(true);
    expect(result.stack.some(s => s.name === 'Whey Protein Isolate')).toBe(true);
  });

  test('should include omega-3 for users over 30', () => {
    const userProfile = {
      goal: 'general health',
      age: 35,
      weight: 150,
      height: "5'10",
      experience: 'Beginner'
    };

    const result = generateSupplementStack(userProfile);
    expect(result.stack.some(s => s.name === 'Omega-3 Fish Oil')).toBe(true);
  });
});