import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedBackground, setSelectedBackground] = useState('/backgrounds/mbckgrd1.jpg');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar_01.jpeg');

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
          <div className="flex items-center justify-center gap-6">
            <img 
              src="/logo.png" 
              alt="K1R4 Logo" 
              className="h-20 w-20 object-contain drop-shadow-lg" 
            />
            <div className="text-left text-white drop-shadow-lg">
              <h2 className="text-4xl font-bold">
                K1R4: Your Anime Life Advisor
              </h2>
              <p className="text-xl">
                Empowering women with tips & style!
              </p>
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
        
        {/* Navigation Tabs */}
        <div className="relative z-10 flex justify-center gap-4 p-4">
          {['chat', 'wardrobe', 'outfit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/80 text-purple-600 hover:bg-white'
              }`}
            >
              {tab === 'chat' && 'Chat with K1R4'}
              {tab === 'wardrobe' && 'Wardrobe Builder'}
              {tab === 'outfit' && 'Outfit Suggester'}
            </button>
          ))}
        </div>

        {/* Background Selector */}
        <div className="relative z-10 flex justify-center gap-2 p-4">
          {backgrounds.map((bg) => (
            <button
              key={bg.value}
              onClick={() => handleBackgroundChange(bg.value)}
              className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                selectedBackground === bg.value ? 'border-white shadow-lg' : 'border-gray-300'
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

        {/* Main Content */}
        <div className="relative z-10 container mx-auto p-4">
          {/* Simple content for each tab */}
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center">
                  <img src={selectedAvatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-700">K1R4</h3>
                  <p className="text-gray-600">Your Anime Wardrobe & Life Advisor</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-800 flex items-start gap-3">
                  <img src="/logo.png" alt="K1R4 Logo" className="h-6 w-6 object-contain mt-1" />
                  <p>Hi! I'm K1R4, your anime wardrobe advisor. Ask me for life tips or outfit ideas! 🌟</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask K1R4 about outfits, style tips, or life advice..."
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