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
      await setDoc(itemRef, {
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
      });
      
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
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Publicar Artículo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div 
          className="aspect-square w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative"
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <div className="flex justify-center space-x-4 mb-4">
                <button type="button" className="p-4 bg-white rounded-full shadow-sm text-indigo-600">
                  <Camera className="w-6 h-6" />
                </button>
                <button 
                  type="button" 
                  onClick={generatePlaceholderImage}
                  className="p-4 bg-white rounded-full shadow-sm text-indigo-600"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 font-medium">Toma una foto o genera una de prueba</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué ofreces?</label>
            <input
              type="text"
              required
              placeholder="Ej. Guitarra Eléctrica Fender"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              required
              rows={3}
              placeholder="Cuenta los detalles, tiempo de uso, etc."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
              >
                <option value="new">Nuevo</option>
                <option value="like-new">Como Nuevo</option>
                <option value="good">Buen Estado</option>
                <option value="fair">Aceptable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="electronics">Electrónica</option>
                <option value="fashion">Moda</option>
                <option value="home">Hogar</option>
                <option value="sports">Deportes</option>
                <option value="gaming">Videojuegos</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input
              type="text"
              placeholder="Ej. Medellín"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué buscas a cambio?</label>
            <input
              type="text"
              placeholder="Ej. Consola de videojuegos, bicicleta..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.lookingFor}
              onChange={e => setFormData({...formData, lookingFor: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div>
              <h4 className="font-medium text-amber-900">Subasta de Trueque</h4>
              <p className="text-xs text-amber-700 mt-0.5">Recibe múltiples ofertas y elige la mejor</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.isAuction}
                onChange={e => setFormData({...formData, isAuction: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors active:scale-95 flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publicar Objeto'}
        </button>
      </form>
    </div>
  );
}
