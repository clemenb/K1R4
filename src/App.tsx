import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedBackground, setSelectedBackground] = useState('/backgrounds/mbckgrd1.jpg');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar_01.jpeg');
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    image: string;
    category: string;
    subcategory: string;
    confirmed: boolean;
  }>>(() => {
    // Load uploaded images from localStorage
    const saved = localStorage.getItem('wardrobe_images');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data to include subcategory field
      return parsed.map((item: any) => ({
        ...item,
        subcategory: item.subcategory || 'Other'
      }));
    }
    return [];
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [editingItem, setEditingItem] = useState<{id: string; image: string; category: string; subcategory: string; confirmed: boolean} | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [manualSelectedItems, setManualSelectedItems] = useState<string[]>([]);
  const [generatorMode, setGeneratorMode] = useState<'ai' | 'manual'>('ai');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clothingCategories = {
    'Head-cover': ['Hats', 'Caps', 'Beanies', 'Headbands', 'Scarves', 'Turbans', 'Hijabs', 'Other'],
    'Top': ['T-Shirt', 'Shirt', 'Blouse', 'Sweater', 'Hoodie', 'Jacket', 'Coat', 'Tank Top', 'Crop Top', 'Polo Shirt', 'Dress Shirt', 'Other'],
    'Belts': ['Leather Belt', 'Fabric Belt', 'Chain Belt', 'Waist Belt', 'Other'],
    'Bottom': ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Dress', 'Leggings', 'Sweatpants', 'Cargo Pants', 'Other'],
    'Shoes': ['Sneakers', 'Boots', 'Sandals', 'Loafers', 'Heels', 'Flats', 'Ballerinas', 'Running Shoes', 'Basketball Shoes', 'Dress Shoes', 'Other'],
    'Underwear': ['Bra', 'Panties', 'Boxers', 'Briefs', 'Undershirt', 'Other'],
    'Accessories': ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Watch', 'Sunglasses', 'Glasses', 'Bag', 'Backpack', 'Wallet', 'Other'],
    'Other': ['Swimwear', 'Sportswear', 'Sleepwear', 'Costume', 'Other']
  };

  const backgrounds = [
    { value: '/backgrounds/mbckgrd1.jpg', label: 'African Style', avatar: '/avatars/avatar_01.jpeg' },
    { value: '/backgrounds/mbckgrd2.jpg', label: 'Asian Style', avatar: '/avatars/avatar_02.jpeg' },
    { value: '/backgrounds/mbckgrd3.jpg', label: 'European Style', avatar: '/avatars/avatar_03.jpeg' },
  ];

  const eventTypes = [
    'Casual', 'Sporty', 'Classic', 'Romantic', 'Work/Office', 
    'Date/Party', 'Business', 'Sports/Workout', 'Wandering/Hiking'
  ];

  const handleBackgroundChange = (backgroundValue: string) => {
    setSelectedBackground(backgroundValue);
    const bg = backgrounds.find(b => b.value === backgroundValue);
    if (bg) {
      setSelectedAvatar(bg.avatar);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newItem = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              image: e.target.result as string,
              category: 'Unknown',
              subcategory: 'Other',
              confirmed: false
            };
            setUploadedImages(prev => {
              const updated = [...prev, newItem];
              localStorage.setItem('wardrobe_images', JSON.stringify(updated));
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSingleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.multiple = false;
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleBulkUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.multiple = true;
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleFolderUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.multiple = true;
      fileInputRef.current.webkitdirectory = true;
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleGenerateOutfit = () => {
    if (uploadedImages.length === 0) {
      alert('Please upload some clothing items to your wardrobe first!');
      return;
    }
    
    if (generatorMode === 'ai') {
      if (!checkApiKeyBeforeGeneration()) {
        return;
      }
      setShowEventModal(true);
    } else {
      // Manual mode - ensure at least one item is selected
      if (manualSelectedItems.length === 0) {
        alert('Please select at least one clothing item for your outfit!');
        return;
      }
      if (!checkApiKeyBeforeGeneration()) {
        return;
      }
      setShowEventModal(true);
    }
  };

  const toggleManualItemSelection = (itemId: string) => {
    setManualSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else if (prev.length < 8) {
        return [...prev, itemId];
      } else {
        alert('You can select up to 8 items maximum for manual generation.');
        return prev;
      }
    });
  };

  const handleEventSelect = async (eventType: string) => {
    setShowEventModal(false);
    setIsGenerating(true);
    
    try {
      setGeneratedOutfit(null);
      
      let imagesToUse = uploadedImages;
      if (generatorMode === 'manual') {
        // Use only manually selected items
        imagesToUse = uploadedImages.filter(item => manualSelectedItems.includes(item.id));
      }
      
      const generatedImage = await generateOutfitWithGemini(imagesToUse, selectedAvatar, eventType);
      if (generatedImage === 'error') {
        throw new Error('Outfit generation failed');
      }
      setGeneratedOutfit(generatedImage);
    } catch (error) {
      console.error('Outfit generation failed:', error);
      alert('Outfit generation failed. Please try again.');
      setGeneratedOutfit(selectedAvatar);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateOutfitWithGemini = async (clothingImages: Array<{id: string; image: string; category: string; confirmed: boolean}>, avatarImage: string, eventType: string) => {
    console.log(`Using Gemini 2.5 Flash Image for ${eventType} event`);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-image" 
      });

      // Create a prompt that uses the categorized clothing
      const clothingCategories = clothingImages.map(item => item.category).filter(cat => cat !== 'Unknown');
      const prompt = `Create an anime-style outfit for a ${eventType} event using these clothing categories: ${clothingCategories.join(', ')}. Make the full body avatar wear appropriate clothing combinations for this occasion.`;

      const base64ToGenerativePart = (base64Data: string, mimeType: string) => {
        const base64WithoutPrefix = base64Data.includes('base64,') 
          ? base64Data.split('base64,')[1] 
          : base64Data;
        
        return {
          inlineData: {
            data: base64WithoutPrefix,
            mimeType: mimeType
          }
        };
      };

      const imageParts = [
        base64ToGenerativePart(avatarImage, 'image/jpeg')
      ];

      // Only use confirmed and categorized items for generation
      clothingImages.filter(item => item.confirmed && item.category !== 'Unknown')
                   .forEach(item => {
                     imageParts.push(base64ToGenerativePart(item.image, 'image/jpeg'));
                   });

      console.log('Sending request to Gemini 2.5 Flash Image...');

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      
      console.log('Generation response:', response);

      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const content = response.candidates[0].content;
        
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            const generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            console.log('Successfully extracted generated image');
            
            try {
              const savedOutfits = JSON.parse(localStorage.getItem('generated_outfits') || '[]');
              savedOutfits.push({
                image: generatedImage,
                eventType: eventType,
                timestamp: new Date().toISOString()
              });
              localStorage.setItem('generated_outfits', JSON.stringify(savedOutfits));
            } catch (saveError) {
              console.warn('Could not save outfit to localStorage:', saveError);
            }
            
            return generatedImage;
          }
        }
        
        for (const part of content.parts) {
          if (part.text) {
            console.log('Model returned text:', part.text);
          }
        }
      }

      throw new Error('The model did not generate an image. It may have returned text instead.');

    } catch (error) {
      console.error('Gemini 2.5 Flash Image generation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`AI Outfit generation failed: ${errorMessage}\n\nPlease ensure:\n1. Your API key is valid\n2. You have set up billing for Gemini API\n3. You have access to gemini-2.5-flash-image model`);
      
      return 'error';
    }
  };

  const handleRegenerateOutfit = () => {
    setGeneratedOutfit(null);
    setShowEventModal(true);
  };

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      localStorage.setItem('wardrobe_images', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
  };

  const checkApiKeyBeforeGeneration = () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return false;
    }
    return true;
  };

  // Categorization functions
  const handleEditCategory = (item: {id: string; image: string; category: string; subcategory: string; confirmed: boolean}) => {
    setEditingItem(item);
    setSelectedMainCategory(null);
  };

  const handleUpdateCategory = (itemId: string, newCategory: string, newSubcategory: string = 'Other') => {
    setUploadedImages(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, category: newCategory, subcategory: newSubcategory, confirmed: true } : item
      );
      localStorage.setItem('wardrobe_images', JSON.stringify(updated));
      return updated;
    });
    setEditingItem(null);
  };

  const categorizeWithAI = async (itemId: string, imageData: string) => {
    if (!checkApiKeyBeforeGeneration()) {
      return;
    }

    setIsCategorizing(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash"  // Using text model for categorization
      });

      const prompt = `Analyze this clothing item image and categorize it into exactly one of these categories: Head-cover, Top, Belts, Bottom, Shoes, Underwear, Accessories, Other. Only respond with the category name, nothing else.`;

      const base64ToGenerativePart = (base64Data: string, mimeType: string) => {
        const base64WithoutPrefix = base64Data.includes('base64,') 
          ? base64Data.split('base64,')[1] 
          : base64Data;
        
        return {
          inlineData: {
            data: base64WithoutPrefix,
            mimeType: mimeType
          }
        };
      };

      const imagePart = base64ToGenerativePart(imageData, 'image/jpeg');
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const category = response.text().trim();

      // Validate the category
      const validCategories = ['Head-cover', 'Top', 'Belts', 'Bottom', 'Shoes', 'Underwear', 'Accessories', 'Other'];
      const finalCategory = validCategories.includes(category) ? category : 'Other';

      setUploadedImages(prev => {
        const updated = prev.map(item => 
          item.id === itemId ? { ...item, category: finalCategory, confirmed: false } : item
        );
        localStorage.setItem('wardrobe_images', JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      console.error('AI categorization failed:', error);
      alert('AI categorization failed. Please categorize manually.');
    } finally {
      setIsCategorizing(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 glass-effect relative z-50">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/backgrounds/head-bckgrd.png')` }}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="K1R4 Logo" 
                className="h-20 w-20 object-contain drop-shadow-lg" 
              />
              <div className="text-left text-white drop-shadow-lg">
                <h2 className="text-lg font-bold">
                  Your Wardrobe Adviser
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {apiKey && (
                  <div className="text-white text-sm bg-green-600/80 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="text-xs">🔑</span>
                    <span className="text-xs">API Key Set</span>
                    <button 
                      onClick={handleRemoveApiKey}
                      className="text-xs hover:text-red-200"
                      title="Remove API Key"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <div className="relative">
                  <button 
                    onClick={() => setShowBackgroundMenu(!showBackgroundMenu)}
                    className="text-white p-1 transition-all flex items-center gap-1 hover:scale-110"
                    title="Change Background"
                  >
                    <span className="text-xl">🎨</span>
                    <span className={`transform transition-transform text-xs ${showBackgroundMenu ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {showBackgroundMenu && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-2 z-50">
                      <div className="flex flex-col gap-2">
                        {backgrounds.map((bg) => (
                          <button
                            key={bg.value}
                            onClick={() => {
                              handleBackgroundChange(bg.value);
                              setShowBackgroundMenu(false);
                            }}
                            className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                              selectedBackground === bg.value ? 'border-white shadow-lg' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <img 
                              src={bg.value} 
                              alt={bg.label}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {['chat', 'wardrobe', 'outfit'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-2xl transition-all ${
                      activeTab === tab
                        ? 'text-white scale-110'
                        : 'text-white/70 hover:text-white hover:scale-105'
                    }`}
                    title={tab === 'chat' ? 'Chat' : tab === 'wardrobe' ? 'Wardrobe Builder' : 'Outfit Suggester'}
                  >
                    {tab === 'chat' && '💬'}
                    {tab === 'wardrobe' && '📷'}
                    {tab === 'outfit' && '👗'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Background Container */}
      <div 
        className="flex-1 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${selectedBackground})` }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Main Content */}
        <div className="relative z-10 container mx-auto p-4">
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-800 flex items-start gap-3">
                  <img src="/logo.png" alt="K1R4 Logo" className="h-6 w-6 object-contain mt-1" />
                  <p>Hi! I'm your wardrobe advisor. Ask me for outfit ideas! 🌟</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask about outfits, style tips, or advice..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wardrobe' && (
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Build Your Wardrobe</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button 
                  onClick={handleSingleUploadClick}
                  className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-all"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <p className="font-semibold">Single Images</p>
                  <p className="text-sm text-gray-600">Upload individual clothing items</p>
                </button>
                <button 
                  onClick={handleBulkUploadClick}
                  className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-all"
                >
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="font-semibold">Bulk Upload</p>
                  <p className="text-sm text-gray-600">Upload multiple items at once</p>
                </button>
                <button 
                  onClick={handleFolderUploadClick}
                  className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-all"
                >
                  <div className="text-4xl mb-2">📂</div>
                  <p className="font-semibold">Folder Upload</p>
                  <p className="text-sm text-gray-600">Upload entire folders</p>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadedImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-purple-700 mb-4">
                    Your Wardrobe ({uploadedImages.filter(item => item.confirmed).length} categorized / {uploadedImages.length} total)
                  </h3>
                  
                  {/* Categorization Instructions */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-purple-700 mb-2">How to categorize your clothes:</h4>
                    <ol className="list-decimal list-inside text-sm text-purple-600 space-y-1">
                      <li>Click on any item to categorize it</li>
                      <li>Choose from: Head-cover, Top, Belts, Bottom, Shoes, Underwear, Accessories, Other</li>
                      <li>Only categorized items will be used for outfit generation</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedImages.map((item, index) => (
                      <div key={item.id} className="relative group">
                        <img 
                          src={item.image} 
                          alt={`Wardrobe item ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg border-2 ${
                            item.confirmed ? 'border-green-500' : 'border-purple-200'
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-white text-xs px-2 py-1 rounded ${
                              item.confirmed ? 'bg-green-600' : 'bg-yellow-600'
                            }`}>
                              {item.category} {item.confirmed ? '✓' : '?'}
                            </span>
                            {item.category !== 'Unknown' && (
                              <span className="text-white text-xs bg-blue-600 px-2 py-1 rounded">
                                {item.subcategory}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditCategory(item)}
                              className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadedImages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👗</div>
                  <p className="text-gray-500 text-lg">No items in your wardrobe yet</p>
                  <p className="text-gray-400">Upload some clothing items to get started!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'outfit' && (
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Outfit Generation</h2>
              
              {/* Generator Mode Selection */}
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setGeneratorMode('ai')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      generatorMode === 'ai' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🤖 AI Generator
                  </button>
                  <button
                    onClick={() => setGeneratorMode('manual')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      generatorMode === 'manual' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    👤 Manual Generator
                  </button>
                </div>

                {generatorMode === 'ai' ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Premium AI Outfit Generation</h3>
                    <p className="text-gray-600 mb-4">
                      Our AI will analyze your clothing items and create stunning anime-style outfits 
                      that match your selected event type and personal style.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Manual Outfit Selection</h3>
                    <p className="text-gray-600 mb-4">
                      Choose up to 8 specific clothing items from your wardrobe, and our AI will create 
                      an anime-style outfit using only your selected items.
                    </p>
                    {manualSelectedItems.length > 0 && (
                      <p className="text-sm text-purple-600 mb-2">
                        Selected: {manualSelectedItems.length}/8 items
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Manual Selection Wardrobe */}
              {generatorMode === 'manual' && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3">Select Items for Your Outfit (max 8):</h4>
                  {uploadedImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {uploadedImages.map((item, index) => (
                        <div key={item.id} className="relative group">
                          <img 
                            src={item.image} 
                            alt={`Wardrobe item ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg border-2 cursor-pointer ${
                              manualSelectedItems.includes(item.id) 
                                ? 'border-green-500 ring-2 ring-green-300' 
                                : 'border-purple-200'
                            }`}
                            onClick={() => toggleManualItemSelection(item.id)}
                          />
                          <div className="absolute top-1 right-1">
                            {manualSelectedItems.includes(item.id) && (
                              <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                            <span className="text-white text-xs bg-black/70 px-2 py-1 rounded">
                              {item.category} - {item.subcategory}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No items in your wardrobe yet. Upload some clothing items first!</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* No Generated Outfit State */}
              {!generatedOutfit ? (
                <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={selectedAvatar} 
                      alt="Selected Avatar" 
                      className="w-32 h-32 object-cover rounded-full border-4 border-purple-300"
                    />
                    <p className="text-center mt-2 text-sm text-gray-600">Your Avatar</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">
                      {generatorMode === 'ai' ? 'Create Your Perfect Outfit' : 'Create Custom Outfit'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {generatorMode === 'ai' 
                        ? 'Our AI will analyze your clothing items and create stunning anime-style outfits that match your selected event type and personal style.'
                        : 'Our AI will create an anime-style outfit using only the items you selected, perfect for your chosen event.'
                      }
                    </p>
                    <button 
                      onClick={handleGenerateOutfit}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      disabled={
                        uploadedImages.length === 0 || 
                        (generatorMode === 'manual' && manualSelectedItems.length === 0)
                      }
                    >
                      {uploadedImages.length === 0 
                        ? 'Upload Clothes First' 
                        : generatorMode === 'manual' && manualSelectedItems.length === 0
                        ? 'Select Items First'
                        : `Generate ${generatorMode === 'ai' ? 'AI' : 'Manual'} Outfit`
                      }
                    </button>
                  </div>
                </div>
              ) : (
                /* Generated Outfit Results */
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-purple-700 mb-4">
                    Your {generatorMode === 'ai' ? 'AI-Generated' : 'Manual'} Outfit
                  </h3>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <img 
                        src={generatedOutfit} 
                        alt="Generated Outfit" 
                        className="w-80 h-80 object-cover rounded-lg border-4 border-purple-300 shadow-xl"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleRegenerateOutfit}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Generate Another Outfit
                      </button>
                      <button 
                        onClick={() => setGeneratedOutfit(null)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Back to Wardrobe
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-purple-700 mb-2">Generating Your Outfit</h3>
                      <p className="text-gray-600">AI is creating a perfect anime-style outfit for you...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Selection Modal */}
              {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                    <h3 className="text-xl font-bold text-purple-700 mb-4">Select Event Type</h3>
                    <p className="text-gray-600 mb-4">Choose the occasion for your outfit:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {eventTypes.map((event) => (
                        <button
                          key={event}
                          onClick={() => handleEventSelect(event)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        >
                          {event}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setShowEventModal(false)}
                      className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* API Key Setup Modal */}
              {showApiKeyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                  <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                    <h3 className="text-xl font-semibold text-purple-700 mb-3">AI Assistant Setup</h3>
                    
                    <div className="flex-1 overflow-y-auto pr-1">
                      <div className="space-y-3">
                        <div className="bg-purple-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</div>
                            <h4 className="font-medium text-purple-800 text-sm">Access Google AI Studio</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">Open Google AI Studio in a new tab:</p>
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                          >
                            Open Google AI Studio
                          </a>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</div>
                            <h4 className="font-medium text-purple-800 text-sm">Create API Key</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">Once loaded:</p>
                          <ol className="list-decimal list-inside text-gray-600 text-sm space-y-0.5">
                            <li>Click "Create API Key"</li>
                            <li>Select "Create API Key in new project"</li>
                            <li>Copy the generated key</li>
                          </ol>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</div>
                            <h4 className="font-medium text-purple-800 text-sm">Enter API Key</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">Paste your key here (stored locally):</p>
                          <input
                            type="password"
                            placeholder="Paste Gemini API key..."
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            onChange={(e) => setApiKey(e.target.value)}
                            value={apiKey}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            🔒 Stored locally in your browser
                          </p>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</div>
                            <h4 className="font-medium text-purple-800 text-sm">Ready to Create</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Start generating anime-style outfits! Usage limits managed by Google.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button 
                        onClick={() => handleSaveApiKey(apiKey)}
                        disabled={!apiKey.trim()}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                      >
                        Save & Start Creating
                      </button>
                      <button 
                        onClick={() => setShowApiKeyModal(false)}
                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}


            </div>
          )}
        </div>
      </div>

      {/* Categorization Modal - Moved outside tabs to be accessible from wardrobe */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-purple-700 mb-4">Categorize Clothing Item</h3>
            
            <div className="flex flex-col items-center mb-6">
              <img 
                src={editingItem.image} 
                alt="Item to categorize"
                className="w-32 h-32 object-cover rounded-lg border-2 border-purple-300 mb-4"
              />
              
              {!selectedMainCategory ? (
                <div className="grid grid-cols-2 gap-2 w-full">
                  {Object.keys(clothingCategories).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedMainCategory(category)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={() => setSelectedMainCategory(null)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      ← Back
                    </button>
                    <h4 className="font-semibold text-purple-700">Select {selectedMainCategory} type:</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {clothingCategories[selectedMainCategory as keyof typeof clothingCategories].map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => handleUpdateCategory(editingItem.id, selectedMainCategory, subcategory)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">Or use AI to categorize (requires API key):</p>
              <button 
                onClick={() => categorizeWithAI(editingItem.id, editingItem.image)}
                disabled={!apiKey || isCategorizing}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                {isCategorizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    AI Categorizing...
                  </>
                ) : (
                  '🤖 Use AI to Categorize'
                )}
              </button>
            </div>

            <button 
              onClick={() => setEditingItem(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Categorization Loading */}
      {isCategorizing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">AI Categorizing Your Item</h3>
              <p className="text-gray-600">Analyzing clothing item to determine category...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
