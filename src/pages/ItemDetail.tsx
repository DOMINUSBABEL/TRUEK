import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, ShieldCheck, ArrowLeft, HeartHandshake } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedMyItem, setSelectedMyItem] = useState<string>('');

  useEffect(() => {
    const fetchItemAndOwner = async () => {
      if (!id) return;
      try {
        const itemDoc = await getDoc(doc(db, 'items', id));
        if (itemDoc.exists()) {
          const itemData = itemDoc.data();
          setItem({ id: itemDoc.id, ...itemData });
          
          const ownerDoc = await getDoc(doc(db, 'users', itemData.ownerId));
          if (ownerDoc.exists()) {
            setOwner(ownerDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndOwner();
  }, [id]);

  const fetchMyItems = async () => {
    if (!user) return;
    const q = query(collection(db, 'items'), where('ownerId', '==', user.uid), where('status', '==', 'available'));
    const snapshot = await getDocs(q);
    setMyItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleOfferClick = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para hacer una oferta');
      return;
    }
    if (myItems.length === 0) {
      fetchMyItems();
    }
    setShowOfferModal(true);
  };

  const submitOffer = async () => {
    if (!selectedMyItem || !user || !item) return;
    
    try {
      const tradeRef = doc(collection(db, 'trades'));
      await setDoc(tradeRef, {
        id: tradeRef.id,
        targetItemId: item.id,
        targetOwnerId: item.ownerId,
        offererId: user.uid,
        offeredItemId: selectedMyItem,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('¡Oferta enviada con éxito!');
      setShowOfferModal(false);
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error('Hubo un error al enviar la oferta');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-gray-500">Artículo no encontrado</div>;
  }

  const isMyItem = user?.uid === item.ownerId;

  return (
    <div className="pb-24">
      <div className="relative aspect-square bg-gray-100">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur p-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        {item.isAuction && (
          <div className="absolute bottom-4 left-4 bg-amber-500 text-white font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            Subasta Activa
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{item.title}</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
            {item.condition === 'new' ? 'Nuevo' : item.condition === 'like-new' ? 'Como Nuevo' : item.condition === 'good' ? 'Buen Estado' : 'Aceptable'}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            <MapPin className="w-3 h-3 mr-1" />
            {item.location || 'Local'}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            <Clock className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Descripción</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>

        {item.lookingFor && (
          <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-900 mb-1 flex items-center">
              <HeartHandshake className="w-4 h-4 mr-1.5" />
              Busca a cambio:
            </h3>
            <p className="text-indigo-700 text-sm">{item.lookingFor}</p>
          </div>
        )}

        {owner && (
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ofrecido por</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={owner.photoURL || `https://ui-avatars.com/api/?name=${owner.displayName}`} alt={owner.displayName} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-medium text-gray-900 flex items-center">
                    {owner.displayName}
                    {owner.verified && <ShieldCheck className="w-4 h-4 text-green-500 ml-1" />}
                  </p>
                  <p className="text-xs text-gray-500">⭐ {owner.reputation || 5.0} de reputación</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {!isMyItem && (
        <div className="fixed bottom-16 w-full max-w-md bg-white border-t border-gray-200 p-4 pb-safe">
          <button 
            onClick={handleOfferClick}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors active:scale-95"
          >
            {item.isAuction ? 'Participar en Subasta' : 'Ofrecer Trueque'}
          </button>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Elige qué ofrecer</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {myItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes artículos publicados para ofrecer.</p>
                <button 
                  onClick={() => { setShowOfferModal(false); navigate('/add'); }}
                  className="text-indigo-600 font-medium"
                >
                  Publicar un artículo ahora
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto mb-6">
                {myItems.map(myItem => (
                  <label 
                    key={myItem.id} 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedMyItem === myItem.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="myItem" 
                      value={myItem.id} 
                      checked={selectedMyItem === myItem.id}
                      onChange={() => setSelectedMyItem(myItem.id)}
                      className="sr-only"
                    />
                    <img src={myItem.imageUrl} alt={myItem.title} className="w-12 h-12 rounded-lg object-cover mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{myItem.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{myItem.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMyItem === myItem.id ? 'border-indigo-600' : 'border-gray-300'}`}>
                      {selectedMyItem === myItem.id && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {myItems.length > 0 && (
              <button
                onClick={submitOffer}
                disabled={!selectedMyItem}
                className="w-full bg-indigo-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Enviar Oferta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
