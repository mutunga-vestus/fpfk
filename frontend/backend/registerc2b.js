// One-off script: tells Safaricom where to send Paybill payment notifications.
//
// Run this:
//   - the first time you set up C2B
//   - every time your public callback URL changes (e.g. you restarted ngrok
//     and got a new subdomain, or you deployed to a new production URL)
//
// Usage:
//   node registerC2b.js
 
import { registerC2BUrls } from './mpesa.js';
 
try {
  const result = await registerC2BUrls();
  console.log('C2B URLs registered successfully:');
  console.log(result);
} catch (err) {
  console.error('Failed to register C2B URLs:', err.message);
  process.exit(1);
}
 