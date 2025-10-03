# Free Generator Setup for K1R4

This guide will help you set up the free AI generator backend for the K1R4 app that provides truly free outfit generation without API keys.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **pip** (Python package manager)

## Installation Steps

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Free Generator Server

```bash
cd backend
python free_generator.py
```

The free generator will start on `http://localhost:5001`

### 3. Start the Frontend

In a new terminal window:

```bash
pnpm run dev
```

The frontend will start on `http://localhost:5173`

## How It Works

### Current Implementation:
- **Sophisticated Simulation**: Uses advanced image processing to create outfit combinations
- **Event-Based Styling**: Applies different visual styles based on event type
- **No API Keys Required**: Completely free to use

### Future AI4Free Integration:
We can integrate with the AI4Free library to add true AI generation:

```python
# Potential future integration
from ai4free import VLM, ThinkAnyAI, BlackboxAI

# Use VLM for multi-modal image generation
vlm = VLM(model="llava-hf/llava-1.5-7b-hf")
response = vlm.ask(prompt_with_images)

# Or use other free providers
thinkai = ThinkAnyAI()
blackbox = BlackboxAI()
```

## API Endpoints

### Health Check
- **GET** `http://localhost:5001/api/free-health`
- Returns server status

### Generate Free Outfit
- **POST** `http://localhost:5001/api/free-generate-outfit`
- Request body:
```json
{
  "avatar_image": "base64_encoded_image",
  "clothing_images": ["base64_image1", "base64_image2"],
  "event_type": "Casual"
}
```

## Cost Information

- **Cost**: Completely free
- **No billing required**
- **No API keys needed**

## Future Enhancements

1. **AI4Free Integration**: Add true AI generation using free providers
2. **Stable Diffusion**: Integrate with free Stable Diffusion models
3. **Hugging Face**: Use free models from Hugging Face
4. **Multiple Providers**: Fallback between different free AI services

## Troubleshooting

### Common Issues

1. **Port 5001 already in use**
   - Use a different port: `python free_generator.py --port 5002`
   - Update the frontend to use the new port

2. **Module not found errors**
   - Run `pip install -r requirements.txt` again

3. **CORS errors**
   - Ensure the free generator is running on port 5001
   - Check that Flask-CORS is installed

## Development Notes

- The free generator uses Flask with CORS enabled
- Images are processed as base64 strings
- Maximum of 3 clothing items per request for performance
- Generated images are returned as base64 data URLs
- Easy to extend with new free AI providers
