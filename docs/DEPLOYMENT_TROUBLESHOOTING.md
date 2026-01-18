# Deployment Troubleshooting Guide

## OpenAI API Key Error (HTTP 401)

### Error Message
```
HTTP 401 (invalid_request_error: invalid_api_key)
Incorrect API key provided: ${OPENAI_API_KEY}.
```

### Problem
The backend API deployed on Azure Container Apps is missing or has an incorrectly configured OpenAI API key. The error shows that the backend is trying to use a literal placeholder `${OPENAI_API_KEY}` instead of the actual API key value.

### Solution

#### For Azure Container Apps Deployment

1. **Access Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to your Container App: `sqordia-production-api`

2. **Configure Environment Variables**
   - Go to **Configuration** → **Environment variables**
   - Add or update the following environment variable:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your actual OpenAI API key (starts with `sk-...`)
     - **Secret**: ✅ Enable this option to mark it as a secret

3. **Alternative: Use Azure Key Vault** (Recommended for production)
   - Create a Key Vault secret for `OPENAI_API_KEY`
   - Reference it in your Container App configuration
   - This provides better security and secret rotation capabilities

4. **Restart the Container App**
   - After updating environment variables, restart the container app
   - Go to **Overview** → Click **Restart**

#### For Other Deployment Platforms

**Netlify (if backend is on Netlify):**
- Go to Site settings → Environment variables
- Add `OPENAI_API_KEY` with your API key value

**Docker/Container:**
- Ensure the environment variable is passed when running the container:
  ```bash
  docker run -e OPENAI_API_KEY=your-key-here ...
  ```

**Kubernetes:**
- Update your deployment YAML to include the secret:
  ```yaml
  env:
    - name: OPENAI_API_KEY
      valueFrom:
        secretKeyRef:
          name: openai-secret
          key: api-key
  ```

### Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again)
6. Add it to your backend deployment environment variables

### Verification

After configuring the API key:

1. **Check Backend Logs**
   - View logs in Azure Container Apps
   - Look for successful OpenAI service initialization

2. **Test AI Features**
   - Open a business plan in the frontend
   - Click "Help Me Write" or any AI enhancement button
   - If configured correctly, AI content should generate
   - If still failing, check the error message in browser console

3. **Verify Environment Variable**
   - In Azure Portal, check that `OPENAI_API_KEY` is set
   - Ensure it's marked as a secret (not visible in logs)
   - Verify the value doesn't contain quotes or extra spaces

### Common Issues

#### Issue: Environment variable not being read
- **Cause**: Variable name mismatch or not set correctly
- **Solution**: Verify exact variable name is `OPENAI_API_KEY` (case-sensitive)

#### Issue: API key appears as `${OPENAI_API_KEY}` in error
- **Cause**: Template variable not being substituted
- **Solution**: Ensure the environment variable is set as a value, not as a template string

#### Issue: "Invalid API key" even after setting
- **Cause**: API key might be incorrect or expired
- **Solution**: 
  - Generate a new API key from OpenAI
  - Verify the key starts with `sk-`
  - Check OpenAI account has credits/quota available

#### Issue: Works locally but not in production
- **Cause**: Environment variable only set locally
- **Solution**: Ensure the variable is configured in your production deployment platform

### Related Documentation

- [AI Service Setup Guide](./AI_SERVICE_SETUP.md) - Local development setup
- [Environment Configuration](./ENVIRONMENT_CONFIGURATION.md) - Frontend environment variables
- [API Connection Guide](./API_CONNECTION_GUIDE.md) - API integration details
