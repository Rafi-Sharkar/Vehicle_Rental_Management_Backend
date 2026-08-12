import app from './app';
import { ENV } from './config/env';

app.listen(ENV.PORT, () => {
  console.log(`🚀 VRM Backend server running on http://localhost:${ENV.PORT}`);
  console.log(`📊 Environment: ${ENV.NODE_ENV}`);
});
