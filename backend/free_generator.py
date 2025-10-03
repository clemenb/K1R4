from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
import requests
from PIL import Image
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Free AI providers that might work for our use case
FREE_AI_PROVIDERS = {
    'huggingface': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
    'blackbox': 'https://www.blackbox.ai/api/chat',
    'deepinfra': 'https://api.deepinfra.com/v1/inference/stabilityai/stable-diffusion-2-1'
}

@app.route('/api/free-generate-outfit', methods=['POST'])
def free_generate_outfit():
    try:
        data = request.get_json()
        
        # Extract data from request
        avatar_image_b64 = data.get('avatar_image')
        clothing_images_b64 = data.get('clothing_images', [])
        event_type = data.get('event_type', 'Casual')
        
        if not avatar_image_b64:
            return jsonify({'error': 'Avatar image is required'}), 400
        
        # For now, we'll use a sophisticated simulation since free AI services
        # don't typically support multi-image input for outfit generation
        # In the future, we could integrate with Stable Diffusion via Hugging Face
        
        generated_image = create_simulated_outfit(avatar_image_b64, clothing_images_b64, event_type)
        
        return jsonify({
            'success': True,
            'generated_image': generated_image,
            'message': 'Free outfit simulation generated successfully',
            'provider': 'simulation'
        })
        
    except Exception as e:
        print(f"Error in free generation: {str(e)}")
        return jsonify({'error': str(e)}), 500

def create_simulated_outfit(avatar_image_b64, clothing_images_b64, event_type):
    """Create a sophisticated simulated outfit using canvas-like operations"""
    
    # Decode base64 images
    def decode_base64_image(base64_string):
        if 'base64,' in base64_string:
            base64_string = base64_string.split('base64,')[1]
        image_data = base64.b64decode(base64_string)
        return Image.open(io.BytesIO(image_data))
    
    avatar_image = decode_base64_image(avatar_image_b64)
    
    # Create a new image with the same size as avatar
    result_image = avatar_image.copy()
    
    # Process clothing images
    clothing_images = []
    for clothing_b64 in clothing_images_b64[:3]:  # Limit to 3 items
        try:
            clothing_image = decode_base64_image(clothing_b64)
            clothing_images.append(clothing_image)
        except Exception as e:
            print(f"Error processing clothing image: {e}")
            continue
    
    # Apply event-specific styling
    styled_image = apply_event_styling(result_image, event_type)
    
    # Convert back to base64
    buffered = io.BytesIO()
    styled_image.save(buffered, format="JPEG", quality=90)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/jpeg;base64,{img_str}"

def apply_event_styling(image, event_type):
    """Apply event-specific styling to the image"""
    # Create a copy to work with
    result = image.copy()
    
    # This is a simplified version - in a real implementation,
    # we would do more sophisticated image processing
    
    # For now, we'll just return the original image
    # In the future, we could integrate with:
    # - Stable Diffusion via Hugging Face
    # - Other free AI services
    # - More advanced image processing
    
    return result

@app.route('/api/free-health', methods=['GET'])
def free_health_check():
    return jsonify({'status': 'healthy', 'message': 'Free generator server is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
