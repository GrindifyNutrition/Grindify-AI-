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

    if (!apiKey || !listId) {
      console.error('Missing environment variables:', {
        hasApiKey: !!apiKey,
        hasListId: !!listId
      });
      throw new Error('Configuration error');
    }

    // Add to Klaviyo list - using V2 API format
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${listId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        profiles: [{
          email: email
        }]
      })
    });

    const responseText = await response.text();
    console.log('API Response:', {
      status: response.status,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`API Error: ${responseText}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed!' 
      })
    };

  } catch (error) {
    console.error('Error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to subscribe',
        details: error.message
      })
    };
  }
};
