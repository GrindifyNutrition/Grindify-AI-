const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Handle stack generation
app.post('/api/stack', async (req, res) => {
  try {
    const userProfile = req.body;
    const stack = await generateSupplementStack(userProfile);
    res.json(stack);
  } catch (error) {
    console.error('Error generating stack:', error);
    res.status(500).json({ error: 'Failed to generate stack' });
  }
});

// Handle email subscriptions
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    // Here you would typically save this to a database
    console.log('New subscription:', email);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});