import React, { useState, useRef } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedBackground, setSelectedBackground] = useState('/backgrounds/mbckgrd1.jpg');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar_01.jpeg');
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    // Check if API key exists in localStorage
    return localStorage.getItem('gemini_api_key') || '';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background and avatar mappings
  const backgrounds = [
    { value: '/backgrounds/mbckgrd1.jpg', label: 'African Style', avatar: '/avatars/avatar_01.jpeg' },
    { value: '/backgrounds/mbckgrd2.jpg', label: 'Asian Style', avatar: '/avatars/avatar_02.jpeg' },
    { value: '/backgrounds/mbckgrd3.jpg', label: 'European Style', avatar: '/avatars/avatar_03.jpeg' },
  ];

  // Event types for outfit generation
  const eventTypes = [
    'Casual', 'Work/Office', 'Party/Night Out', 'Date Night', 'Formal/Black Tie',
    'Business Meeting', 'Brunch', 'Beach/Vacation', 'Workout/Athletic', 'Coffee Date',
    'Shopping', 'Dinner', 'Wedding', 'Interview', 'Cocktail Party',
    'Festival/Concert', 'Weekend Getaway', 'Graduation', 'Birthday Celebration', 'Gala'
  ];

  const handleBackgroundChange = (backgroundValue: string) => {
    setSelectedBackground(backgroundValue);
    // Automatically set the corresponding avatar
    const bg = backgrounds.find(b => b.value === backgroundValue);
    if (bg) {
      setSelectedAvatar(bg.avatar);
    }
  };

  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            setUploadedImages(prev => [...prev, e.target!.result as string]);
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
      fileInputRef.current.click();
    }
  };

  const handleBulkUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };

  const handleFolderUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.multiple = true;
      fileInputRef.current.webkitdirectory = true;
      fileInputRef.current.click();
    }
  };

  // Outfit generation functions
  const handleGenerateOutfit = () => {
    if (uploadedImages.length === 0) {
      alert('Please upload some clothing items to your wardrobe first!');
      return;
    }
    
    if (!checkApiKeyBeforeGeneration()) {
      return;
    }
    
    setShowEventModal(true);
  };

  const handleEventSelect = (eventType: string) => {
    setShowEventModal(false);
    setIsGenerating(true);
    
    // Simulate AI processing (in a real app, this would call an AI API)
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, this would be the AI-generated outfit image
      setGeneratedOutfit(selectedAvatar); // Using avatar as placeholder for now
    }, 3000);
  };

  const handleRegenerateOutfit = () => {
    setGeneratedOutfit(null);
    setShowEventModal(true);
  };

  // API Key management
  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 glass-effect relative z-50">
        {/* Header Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/backgrounds/head-bckgrd.png')` }}
        />
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        
        {/* Content */}
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
            
            {/* Navigation Menu Below Title */}
            <div className="flex items-center gap-4">
              {/* Navigation Tabs as Icons */}
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
              
              {/* Background Dropdown Menu */}
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
          {/* Simple content for each tab */}
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
              
              {/* Upload Options */}
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

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Uploaded Images Gallery */}
              {uploadedImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-purple-700 mb-4">Your Wardrobe ({uploadedImages.length} items)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Wardrobe item ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button 
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                            className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
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
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Outfit Suggestions</h2>
              
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
                    <h3 className="text-lg font-semibold mb-3">Generate Outfit Suggestions</h3>
                    <p className="text-gray-600 mb-4">
                      K1R4 will analyze your wardrobe and create anime-style outfits for your avatar.
                    </p>
                    <button 
                      onClick={handleGenerateOutfit}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
                      disabled={uploadedImages.length === 0}
                    >
                      {uploadedImages.length === 0 ? 'Upload Clothes First' : 'Generate Outfits'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-purple-700 mb-4">Your Generated Outfit</h3>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <img 
                        src={generatedOutfit} 
                        alt="Generated Outfit" 
                        className="w-64 h-64 object-cover rounded-lg border-4 border-purple-300"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleRegenerateOutfit}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Generate Another
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20 overflow-y-auto">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                    <h3 className="text-2xl font-bold text-purple-700 mb-4">Set Up Your AI Assistant</h3>
                    
                    <div className="space-y-6">
                      {/* Step 1 */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                          <h4 className="font-semibold text-purple-800">Go to Google AI Studio</h4>
                        </div>
                        <p className="text-gray-600 mb-3">Click the button below to open Google AI Studio in a new tab:</p>
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Open Google AI Studio
                        </a>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                          <h4 className="font-semibold text-purple-800">Create Your API Key</h4>
                        </div>
                        <p className="text-gray-600 mb-2">Once the page loads:</p>
                        <ol className="list-decimal list-inside text-gray-600 space-y-1">
                          <li>Click "Create API Key"</li>
                          <li>Select "Create API Key in new project"</li>
                          <li>Copy the generated API key</li>
                        </ol>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                          <h4 className="font-semibold text-purple-800">Paste Your API Key</h4>
                        </div>
                        <p className="text-gray-600 mb-3">Paste your API key here (it will be saved securely in your browser):</p>
                        <input
                          type="password"
                          placeholder="Paste your Gemini API key here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onChange={(e) => setApiKey(e.target.value)}
                          value={apiKey}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          🔒 Your API key is stored locally in your browser and never sent to our servers.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                          <h4 className="font-semibold text-purple-800">You're All Set!</h4>
                        </div>
                        <p className="text-gray-600">
                          Once saved, you can start generating unlimited anime-style outfits! 
                          Google will handle any usage limits automatically.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => handleSaveApiKey(apiKey)}
                        disabled={!apiKey.trim()}
                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                      >
                        Save API Key & Start Creating
                      </button>
                      <button 
                        onClick={() => setShowApiKeyModal(false)}
                        className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
    </div>
  );
}

export default App;