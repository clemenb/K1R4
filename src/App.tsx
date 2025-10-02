import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedBackground, setSelectedBackground] = useState('/backgrounds/mbckgrd1.jpg');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar_01.jpeg');
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);

  // Background and avatar mappings
  const backgrounds = [
    { value: '/backgrounds/mbckgrd1.jpg', label: 'African Style', avatar: '/avatars/avatar_01.jpeg' },
    { value: '/backgrounds/mbckgrd2.jpg', label: 'Asian Style', avatar: '/avatars/avatar_02.jpeg' },
    { value: '/backgrounds/mbckgrd3.jpg', label: 'European Style', avatar: '/avatars/avatar_03.jpeg' },
  ];

  const handleBackgroundChange = (backgroundValue: string) => {
    setSelectedBackground(backgroundValue);
    // Automatically set the corresponding avatar
    const bg = backgrounds.find(b => b.value === backgroundValue);
    if (bg) {
      setSelectedAvatar(bg.avatar);
    }
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
                {['wardrobe', 'outfit'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-2xl transition-all ${
                      activeTab === tab
                        ? 'text-white scale-110'
                        : 'text-white/70 hover:text-white hover:scale-105'
                    }`}
                    title={tab === 'wardrobe' ? 'Wardrobe Builder' : 'Outfit Suggester'}
                  >
                    {tab === 'wardrobe' && '👕'}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="font-semibold">Single Images</p>
                  <p className="text-sm text-gray-600">Upload individual clothing items</p>
                </div>
                <div className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="font-semibold">Bulk Upload</p>
                  <p className="text-sm text-gray-600">Upload multiple items at once</p>
                </div>
                <div className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="font-semibold">Folder Upload</p>
                  <p className="text-sm text-gray-600">Upload entire folders</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outfit' && (
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Outfit Suggestions</h2>
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
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Generate Outfits
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;