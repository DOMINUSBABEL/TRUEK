import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AddItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    condition: 'good',
    category: 'electronics',
    lookingFor: '',
    location: '',
    isAuction: false,
  });
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!imageUrl) {
      toast.error('Por favor, añade una imagen');
      return;
    }

    setLoading(true);
    try {
      const itemRef = doc(collection(db, 'items'));
      const itemData: any = {
        id: itemRef.id,
        ownerId: user.uid,
        title: formData.title,
        description: formData.description,
        imageUrl,
        condition: formData.condition,
        category: formData.category,
        lookingFor: formData.lookingFor,
        location: formData.location || 'Medellín', // Default for MVP
        status: 'available',
        isAuction: formData.isAuction,
        createdAt: new Date().toISOString(),
      };

      if (formData.isAuction) {
        const endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + 24);
        itemData.auctionEndsAt = endsAt.toISOString();
      }

      await setDoc(itemRef, itemData);
      
      toast.success('¡Artículo publicado con éxito!');
      navigate('/');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Hubo un error al publicar el artículo');
    } finally {
      setLoading(false);
    }
  };

  // For MVP, we'll just use a placeholder image generator based on title
  const generatePlaceholderImage = () => {
    if (!formData.title) {
      toast.error('Escribe un título primero para generar una imagen');
      return;
    }
    const seed = encodeURIComponent(formData.title.trim().toLowerCase());
    setImageUrl(`https://picsum.photos/seed/${seed}/800/800`);
    toast.success('Imagen de prueba generada');
  };

  return (
    <div className="p-6 pb-32 bg-neutral min-h-screen">
      <h2 className="text-3xl font-heading font-bold text-white mb-8">Publish Asset</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div 
          className="aspect-square w-full bg-surface border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden relative group"
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => setImageUrl('')}
                aria-label="Eliminar imagen"
                className="absolute top-4 right-4 bg-neutral/80 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-neutral transition-colors border border-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  type="button"
                  aria-label="Tomar foto"
                  className="p-4 bg-neutral rounded-full shadow-lg text-primary border border-white/5 hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <button 
                  type="button" 
                  onClick={generatePlaceholderImage}
                  aria-label="Generar imagen de prueba"
                  className="p-4 bg-neutral rounded-full shadow-lg text-primary border border-white/5 hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-500">Take a photo or generate</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">What are you offering?</label>
            <input
              id="title"
              type="text"
              required
              placeholder="e.g. Fender Electric Guitar"
              className="w-full px-5 py-4 rounded-2xl bg-surface border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-gray-600 text-sm"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Description</label>
            <textarea
              id="description"
              required
              rows={3}
              placeholder="Details, condition, etc."
              className="w-full px-5 py-4 rounded-2xl bg-surface border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-white placeholder-gray-600 text-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="condition" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Condition</label>
              <select
                id="condition"
                className="w-full px-5 py-4 rounded-2xl bg-surface border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white text-sm appearance-none"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Acceptable</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Category</label>
              <select
                id="category"
                className="w-full px-5 py-4 rounded-2xl bg-surface border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white text-sm appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home</option>
                <option value="sports">Sports</option>
                <option value="gaming">Gaming</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">City</label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Medellín"
              className="w-full px-5 py-4 rounded-2xl bg-surface border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-gray-600 text-sm"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="lookingFor" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Looking for</label>
            <input
              id="lookingFor"
              type="text"
              placeholder="e.g. Gaming console, bike..."
              className="w-full px-5 py-4 rounded-2xl bg-surface border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-gray-600 text-sm"
              value={formData.lookingFor}
              onChange={e => setFormData({...formData, lookingFor: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-tertiary/10 rounded-[2rem] border border-tertiary/20">
            <label htmlFor="isAuction" className="cursor-pointer">
              <h4 className="font-heading font-bold text-tertiary">Barter Auction</h4>
              <p className="text-[10px] font-bold tracking-widest uppercase text-tertiary/70 mt-1">Receive multiple offers</p>
            </label>
            <label htmlFor="isAuction" className="relative inline-flex items-center cursor-pointer">
              <input 
                id="isAuction"
                type="checkbox" 
                className="sr-only peer"
                checked={formData.isAuction}
                onChange={e => setFormData({...formData, isAuction: e.target.checked})}
              />
              <div className="w-11 h-6 bg-surface border border-white/10 peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-neutral peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full shadow-[0_0_20px_rgba(124,77,255,0.3)] hover:bg-primary-hover transition-colors flex justify-center items-center mt-8"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Asset'}
        </button>
      </form>
    </div>
  );
}
