import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Wand2, Layers, History, Palette, Sparkles, ChevronRight, Star, Users, Zap, Award, Play, ArrowRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Editor from './components/Editor';

// Demo image for the Try Demo feature
const DEMO_IMAGE = 'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=1600&q=80';

const features = [
  {
    icon: Layers,
    title: 'Layer-Based Editing',
    description: 'Professional layer management with masks, blending modes, and adjustments'
  },
  {
    icon: Wand2,
    title: 'AI-Powered Tools',
    description: 'Smart selection, background removal, and auto-enhancement'
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

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Professional Photographer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content: "This editor has revolutionized my workflow. The AI tools are incredible!",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Digital Artist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    content: "Perfect balance of power and ease of use. A game-changer for my projects.",
    rating: 5
  },
  {
    name: "Emily Parker",
    role: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    content: "Finally, a professional editor that works right in the browser!",
    rating: 5
  }
];

const examples = [
  {
    url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80',
    title: 'Photo Retouching',
    description: 'Perfect your photos with professional retouching tools'
  },
  {
    url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=80',
    title: 'Graphic Design',
    description: 'Create stunning designs with powerful tools'
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    title: 'Digital Art',
    description: 'Express your creativity with digital brushes and effects'
  }
];

const stats = [
  { icon: Users, value: '2M+', label: 'Active Users' },
  { icon: Zap, value: '100M+', label: 'Edits Made' },
  { icon: Star, value: '4.9/5', label: 'User Rating' },
  { icon: Award, value: '10+', label: 'Industry Awards' }
];

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showLearnMore, setShowLearnMore] = useState(false);
  
  // Particle effect
  const particlesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const createParticle = () => {
      if (!particlesRef.current) return;
      
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = Math.random() * 5 + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.opacity = (Math.random() * 0.5 + 0.2).toString();
      
      particlesRef.current.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode === particlesRef.current) {
          particlesRef.current.removeChild(particle);
        }
      }, 20000);
    };
    
    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);
  
  // Use intersection observer hooks for animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true });
  const [statsRef, statsInView] = useInView({ triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true });
  const [examplesRef, examplesInView] = useInView({ triggerOnce: true });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleTryDemo = useCallback(() => {
    setIsUploading(true);
    setTimeout(() => {
      setImage(DEMO_IMAGE);
      setIsUploading(false);
    }, 800);
  }, []);

  const handleLearnMore = useCallback(() => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleTryExample = useCallback((exampleUrl: string) => {
    setIsUploading(true);
    setTimeout(() => {
      setImage(exampleUrl);
      setIsUploading(false);
    }, 800);
  }, []);

  if (image) {
    return <Editor imageUrl={image} />;
  }

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Video Background */}
      <div className="video-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-abstract-blue-particles-2584/1080p.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Particle Effect */}
      <div ref={particlesRef} className="particles" />
      
      {/* Hero Section */}
      <header className="relative">
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 pt-6"
        >
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold glow-text">Sarux PS</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#examples" className="text-gray-300 hover:text-white transition-colors">Examples</a>
              <button 
                onClick={handleTryDemo}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors glow"
              >
                Get Started
              </button>
            </div>
            <button className="md:hidden p-2 text-gray-300 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </nav>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 glow-text"
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Professional Photo Editing
              </span>
              <br />
              <span className="text-white">in Your Browser</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 px-4"
            >
              Edit photos like a pro with our powerful, free online image editor.
              No installation required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 px-4"
            >
              <button 
                onClick={handleTryDemo}
                className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl transition-colors flex items-center justify-center space-x-2 glow"
              >
                <Play className="w-5 h-5" />
                <span className="text-lg">Try Demo</span>
              </button>
              <button 
                onClick={handleLearnMore}
                className="glass px-8 py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-lg">Learn More</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="container mx-auto px-4 mb-20"
        >
          <div
            className={`
              max-w-4xl mx-auto glass rounded-2xl p-12 text-center
              transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-blue-400 bg-blue-400/10 scale-102 glow'
                : 'border-gray-600 hover:border-gray-500'
              }
            `}
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
                <Upload className="w-20 h-20 mx-auto mb-6 text-blue-400 float" />
                <h3 className="text-3xl font-semibold mb-4 glow-text">
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
                  className="inline-block bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl font-medium text-lg transition-colors cursor-pointer glow"
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
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 mb-20"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass p-6 rounded-xl text-center feature-card"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-3xl font-bold mb-1 glow-text">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          id="features"
          ref={featuresRef}
          className="container mx-auto px-4 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 glow-text">
              Professional Features, <span className="text-blue-400">Zero Install</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need for professional photo editing, right in your browser
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass p-6 rounded-xl feature-card"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 glow-text">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-20 overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 glow-text">
              Loved by <span className="text-blue-400">Creators</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of satisfied professionals using our editor
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="glass p-8 rounded-xl"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-400 glow"
                  />
                  <div>
                    <h3 className="text-xl font-semibold glow-text">
                      {testimonials[activeTestimonial].name}
                    </h3>
                    <p className="text-gray-400">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-300 mb-4">
                  "{testimonials[activeTestimonial].content}"
                </p>
                <div className="flex space-x-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Examples Section */}
        <motion.section
          id="examples"
          ref={examplesRef}
          className="container mx-auto px-4 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={examplesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 glow-text">
              Endless <span className="text-blue-400">Possibilities</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Create anything you can imagine with our professional tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={examplesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative rounded-xl overflow-hidden feature-card"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={example.url}
                    alt={example.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-semibold mb-2 glow-text">{example.title}</h3>
                  <p className="text-gray-300 mb-4">{example.description}</p>
                  <button 
                    onClick={() => handleTryExample(example.url)}
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
                  >
                    <span>Try it now</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center glass rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-6 glow-text">
              Ready to Start <span className="text-blue-400">Creating?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join millions of creators and start editing your photos professionally today.
            </p>
            <button 
              onClick={handleTryDemo}
              className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl font-medium text-lg transition-colors glow"
            >
              Start Editing Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold glow-text">Sarux PS</span>
              </div>
              <div className="text-gray-400">
                © 2025 Sarux PS. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </header>
    </div>
  );
}

export default App;