import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Wand2, Layers, History, Palette, Sparkles } from 'lucide-react';
import Editor from './components/Editor';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    setError(null);
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setIsUploading(false);
    };

    reader.onerror = () => {
      setError('Error reading file');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  if (image) {
    return <Editor imageUrl={image} />;
  }

  const features = [
    {
      icon: Layers,
      title: 'Layer-Based Editing',
      description: 'Full layer support with blending modes, masks, and adjustments'
    },
    {
      icon: Wand2,
      title: 'Smart Selection Tools',
      description: 'Precise selection tools including Magic Wand and Quick Selection'
    },
    {
      icon: Palette,
      title: 'Professional Tools',
      description: 'Complete set of professional editing tools and filters'
    },
    {
      icon: History,
      title: 'Unlimited History',
      description: 'Comprehensive undo/redo with detailed history panel'
    }
  ];

  const examples = [
    {
      url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      title: 'Photo Retouching'
    },
    {
      url: 'https://images.unsplash.com/photo-1534131707746-25d604851a1f?w=600&q=80',
      title: 'Graphic Design'
    },
    {
      url: 'https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?w=600&q=80',
      title: 'Digital Art'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">Sarux PS</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#examples" className="text-gray-300 hover:text-white transition-colors">Examples</a>
            <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Professional Photo Editing in Your Browser
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Edit photos like a pro with our powerful, free online image editor. No installation required.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20">
        <div
          className={`max-w-4xl mx-auto border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer mb-20 ${
            isDragging
              ? 'border-blue-400 bg-blue-400/10 scale-102'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="animate-pulse">
              <Upload className="w-20 h-20 mx-auto mb-6 text-blue-400" />
              <h3 className="text-2xl font-semibold mb-2">Uploading...</h3>
            </div>
          ) : (
            <>
              <Upload className="w-20 h-20 mx-auto mb-6 text-blue-400" />
              <h3 className="text-3xl font-semibold mb-4">
                Drag & Drop to Start Editing
              </h3>
              <p className="text-gray-400 text-lg mb-8">
                or select a file from your computer
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl font-medium text-lg transition-colors cursor-pointer"
              >
                Choose File
              </label>
              {error && (
                <p className="mt-4 text-red-400 text-lg">{error}</p>
              )}
              <p className="mt-6 text-sm text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP (max 20MB)
              </p>
            </>
          )}
        </div>

        <section id="features" className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Professional Features, <span className="text-blue-400">Zero Install</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="examples" className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Endless <span className="text-blue-400">Possibilities</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl">
                <img
                  src={example.url}
                  alt={example.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex items-end p-6">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span className="text-lg font-medium">{example.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;