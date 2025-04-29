// Database of supplements and their benefits
const supplementDatabase = {
  preworkout: {
    name: 'Pre-Workout Complex',
    dosage: '1 scoop (30g)',
    rationale: 'Enhances energy, focus, and performance during workouts',
    tags: ['performance', 'energy', 'focus']
  },
  creatine: {
    name: 'Creatine Monohydrate',
    dosage: '5g daily',
    rationale: 'Improves strength, muscle mass, and exercise performance',
    tags: ['strength', 'muscle', 'recovery']
  },
  protein: {
    name: 'Whey Protein Isolate',
    dosage: '25g post-workout',
    rationale: 'Supports muscle recovery and growth',
    tags: ['muscle', 'recovery', 'protein']
  },
  bcaa: {
    name: 'BCAA Complex',
    dosage: '5-10g during workout',
    rationale: 'Reduces muscle fatigue and supports recovery',
    tags: ['recovery', 'endurance']
  },
  omega3: {
    name: 'Omega-3 Fish Oil',
    dosage: '2000mg daily',
    rationale: 'Supports joint health and reduces inflammation',
    tags: ['health', 'recovery', 'joints']
  },
  multivitamin: {
    name: 'Advanced Multivitamin',
    dosage: '1 tablet daily',
    rationale: 'Ensures optimal micronutrient levels for performance',
    tags: ['health', 'basics']
  }
};

function generateSupplementStack(userProfile) {
  const stack = [];
  const { goal, age, weight, experience } = userProfile;

  // Basic supplements for everyone
  stack.push(supplementDatabase.multivitamin);

  // Goal-based recommendations
  if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('strength')) {
    stack.push(supplementDatabase.creatine);
    stack.push(supplementDatabase.protein);
  }

  if (goal.toLowerCase().includes('performance') || goal.toLowerCase().includes('energy')) {
    stack.push(supplementDatabase.preworkout);
  }

  if (goal.toLowerCase().includes('recovery') || experience === 'Advanced') {
    stack.push(supplementDatabase.bcaa);
  }

  // Add omega-3 for users over 30 or those mentioning joint health
  if (age > 30 || goal.toLowerCase().includes('joint')) {
    stack.push(supplementDatabase.omega3);
  }

  // Generate daily protocol
  const dailyProtocol = generateProtocol(stack);

  return {
    stack,
    dailyProtocol,
    buyStackLink: generateBuyLink(stack)
  };
}

function generateProtocol(stack) {
  return stack
    .map(supplement => `${supplement.name}: ${supplement.dosage}`)
    .join('\n');
}

function generateBuyLink(stack) {
  // In a real application, this would generate a link to your e-commerce platform
  // with the selected products in the cart
  return '/checkout?products=' + stack.map(s => s.name.toLowerCase().replace(/\s+/g, '-')).join(',');
}

module.exports = generateSupplementStack;