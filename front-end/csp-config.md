# Content Security Policy Configuration for SignalR

## Development Configuration
For development, we use a more permissive CSP that allows SignalR to work:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' ws: wss: http://localhost:51423 https://localhost:51423;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

## Production Configuration (More Secure)
For production, you should use a more restrictive CSP:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' ws: wss: https://your-api-domain.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
">
```

## Why 'unsafe-eval' is needed for SignalR

SignalR uses `eval()` internally for:
1. Dynamic code generation for message serialization
2. Protocol negotiation
3. Transport fallback mechanisms

The `'unsafe-eval'` directive is required for SignalR to function properly.

## Alternative Solutions

If you want to avoid `'unsafe-eval'`, you can:

1. **Use Server-Sent Events (SSE) only**: Configure SignalR to use only SSE transport
2. **Use Long Polling only**: Configure SignalR to use only Long Polling transport
3. **Use a different real-time solution**: Consider alternatives like Socket.IO or WebSockets directly

## Security Considerations

- `'unsafe-eval'` allows dynamic code execution, which can be a security risk
- Only use this in trusted environments
- Consider implementing additional security measures like:
  - Input validation
  - Rate limiting
  - Authentication and authorization
  - Regular security audits

## Testing CSP

Use the browser's developer tools to check for CSP violations:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for CSP violation messages
4. Use the test-signalr.html file to verify SignalR connectivity
