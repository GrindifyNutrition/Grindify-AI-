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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    if (!zapierWebhookUrl) {
      throw new Error('Missing Zapier webhook URL');
    }

    // Send data in the format Klaviyo expects
    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: email,
            subscriptions: {
              email: true,
              sms: false
            }
          }
        },
        timestamp: new Date().toISOString(),
        source: 'landing_page'
      })
    });

    if (!response.ok) {
      console.error('Webhook response:', await response.text());
      throw new Error('Failed to process subscription');
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
    console.error('Subscription error:', error.message);
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
