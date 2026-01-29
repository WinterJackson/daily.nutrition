
// Removed requirement for node-fetch as Node 18+ has native fetch
async function testWebhook() {
  const url = 'http://localhost:3000/api/webhooks/calendly';
  
  // Sample payload matching Calendly structure
  const payload = {
    created_at: new Date().toISOString(),
    event: "invitee.created",
    payload: {
      invitee: {
        email: "test.webhook@example.com",
        name: "Webhook Tester",
      },
      status: "active",
      event: {
        uri: "https://api.calendly.com/events/AAAAAAAA",
        name: "15 Minute Meeting",
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 86400000 + 900000).toISOString(),
        location: {
          type: "physical",
          location: "Coffee Shop"
        }
      },
      uri: "https://api.calendly.com/scheduled_events/AAAAAAAA/invitees/BBBBBBBB"
    }
  };

  try {
    console.log(`🚀 Sending mock webhook to ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Calendly-Webhook-Signature': `t=${Date.now()},v1=dummy_signature` // Mock signature
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}`);
    
    if (response.status === 200) {
        console.log("✅ Webhook endpoint processed the request successfully.");
    } else {
        console.log("❌ Webhook failed (expected 200).");
    }
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
}

testWebhook();
