const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Basic CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Get the email from request body
    const { email } = JSON.parse(event.body);
    
    // Simple validation
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Get Klaviyo credentials
    const apiKey = process.env.KLAVIYO_API_KEY;
    const listId = process.env.KLAVIYO_LIST_ID;

    // Add to Klaviyo list
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${listId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        profiles: [{ email }]
      })
    });

    // Handle response
    if (!response.ok) {
      throw new Error('Failed to subscribe');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Subscribed successfully' 
      })
    };

  } catch (error) {
    console.error('Subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Subscription failed'
      })
    };
  }
};
