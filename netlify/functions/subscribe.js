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
      keyLength: apiKey?.length,
      listId,
      timestamp: new Date().toISOString()
    });

    if (!apiKey || !listId) {
      throw new Error('Missing required environment variables');
    }

    // Updated Klaviyo API call
    const subscribeUrl = `https://a.klaviyo.com/api/v2/list/${listId}/subscribe`;
    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        profiles: [{
          email: email
        }]
      })
    });

    const responseText = await response.text();
    console.log('Klaviyo API Response:', {
      status: response.status,
      text: responseText,
      url: subscribeUrl,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      throw new Error(`Klaviyo API error (${response.status}): ${responseText}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Successfully subscribed to waitlist',
        email: email
      })
    };

  } catch (error) {
    console.error('Subscription error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

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
