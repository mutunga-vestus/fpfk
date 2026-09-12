// One-off script: tells Safaricom where to send Paybill payment notifications.
 
import { registerC2BUrls } from './mpesa.js';
 
try {
  const result = await registerC2BUrls();
  console.log('C2B URLs registered successfully:');
  console.log(result);
} catch (err) {
  console.error('Failed to register C2B URLs:', err.message);
  process.exit(1);
}
 