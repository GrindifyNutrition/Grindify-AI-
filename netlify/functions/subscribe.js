const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse and validate request
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { email } = JSON.parse(event.body);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Get environment variables
    const apiKey = process.env.KLAVIYO_API_KEY;
    const listId = process.env.KLAVIYO_LIST_ID;

    console.log('Processing subscription:', {
      email,
      hasApiKey: !!apiKey,
      listId
    });

    if (!apiKey || !listId) {
      throw new Error('Missing required environment variables');
    }

    // Add member to list using Klaviyo's API
    const response = await fetch('https://a.klaviyo.com/api/v2/list/' + listId + '/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        profiles: [{
          email: email
        }]
      })
    });

    const responseText = await response.text();
    console.log('Klaviyo response:', {
      status: response.status,
      text: responseText
    });

    if (!response.ok) {
      throw new Error(`Failed to subscribe: ${responseText}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Successfully subscribed to waitlist'
      })
    };

  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to subscribe to waitlist',
        details: error.message
      })
    };
  }
};
