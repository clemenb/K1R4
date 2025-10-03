# Backend Setup for K1R4 Outfit Generation

This guide will help you set up the Python backend for the K1R4 app that uses Gemini 2.5 Flash Image Preview.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Google AI API Key** with billing enabled
3. **pip** (Python package manager)

## Installation Steps

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Edit the `backend/.env` file and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Backend Server

```bash
cd backend
python app.py
```

The backend will start on `http://localhost:5000`

### 4. Start the Frontend

In a new terminal window:

```bash
pnpm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Health Check
- **GET** `http://localhost:5000/api/health`
- Returns server status

### Generate Outfit
- **POST** `http://localhost:5000/api/generate-outfit`
- Request body:
```json
{
  "api_key": "user_api_key",
  "avatar_image": "base64_encoded_image",
  "clothing_images": ["base64_image1", "base64_image2"],
  "event_type": "Casual"
}
```

## Billing Information

- **Cost**: $0.04 per image generated
- **Approximate usage**: ~25 images per $1
- **Setup billing**: https://aistudio.google.com/app/billing

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Run `pip install -r requirements.txt` again

2. **API key errors**
   - Ensure billing is enabled on your Google AI account
   - Verify the API key is correct

3. **CORS errors**
   - Ensure the backend is running on port 5000
   - Check that Flask-CORS is installed

4. **Model access errors**
   - Ensure your API key has access to Gemini 2.5 Flash Image Preview
   - Check Google AI Studio for model availability

## Development Notes

- The backend uses Flask with CORS enabled
- Images are processed as base64 strings
- Maximum of 3 clothing items per request to avoid overwhelming the model
- Generated images are returned as base64 data URLs
