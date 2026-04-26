import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, ShieldCheck, ArrowLeft, HeartHandshake, CheckCircle, Star } from 'lucide-react';
import { formatDistanceToNow, differenceInHours, differenceInMinutes } from 'date-fns';
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
  const [auctionOffers, setAuctionOffers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');

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

          if (itemData.isAuction && user?.uid === itemData.ownerId) {
            const q = query(collection(db, 'trades'), where('targetItemId', '==', id), where('status', '==', 'pending'));
            const snapshot = await getDocs(q);
            
            // Extract all unique IDs to fetch in parallel without cascading queries
            const itemIds = new Set<string>();
            const userIds = new Set<string>();
            const tradesData = snapshot.docs.map(doc => {
              const data = doc.data() as any;
              if (data.offeredItemId) itemIds.add(data.offeredItemId);
              if (data.offererId) userIds.add(data.offererId);
              return { id: doc.id, ...data };
            });

            // Fetch referenced items and users in parallel O(1) lookups
            const itemsMap: Record<string, any> = {};
            const usersMap: Record<string, any> = {};

            const fetchPromises: Promise<void>[] = [];

            if (itemIds.size > 0) {
              fetchPromises.push(
                Promise.all(Array.from(itemIds).map(id => getDoc(doc(db, 'items', id)))).then(docs => {
                  docs.forEach(doc => { if (doc.exists()) itemsMap[doc.id] = doc.data(); });
                })
              );
            }
            if (userIds.size > 0) {
              fetchPromises.push(
                Promise.all(Array.from(userIds).map(id => getDoc(doc(db, 'users', id)))).then(docs => {
                  docs.forEach(doc => { if (doc.exists()) usersMap[doc.id] = doc.data(); });
                })
              );
            }

            await Promise.all(fetchPromises);

            const offers = tradesData.map((trade: any) => ({
              ...trade,
              offeredItem: itemsMap[trade.offeredItemId] || null,
              offerer: usersMap[trade.offererId] || null
            }));
            setAuctionOffers(offers);
          }
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndOwner();
  }, [id, user]);

  useEffect(() => {
    if (item?.isAuction && item?.auctionEndsAt) {
      const interval = setInterval(() => {
        const end = new Date(item.auctionEndsAt);
        const now = new Date();
        if (now > end) {
          setTimeLeft('Subasta finalizada');
          clearInterval(interval);
        } else {
          const hours = differenceInHours(end, now);
          const minutes = differenceInMinutes(end, now) % 60;
          setTimeLeft(`${hours}h ${minutes}m restantes`);
        }
      }, 60000);
      
      // Initial calculation
      const end = new Date(item.auctionEndsAt);
      const now = new Date();
      if (now > end) {
        setTimeLeft('Subasta finalizada');
      } else {
        const hours = differenceInHours(end, now);
        const minutes = differenceInMinutes(end, now) % 60;
        setTimeLeft(`${hours}h ${minutes}m restantes`);
      }

      return () => clearInterval(interval);
    }
  }, [item]);

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
    fetchMyItems();
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

  const updateChallengeIfActive = async (userId: string, oldItemId: string, newItemId: string) => {
    const q = query(collection(db, 'challenges'), where('userId', '==', userId), where('status', '==', 'active'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const challengeDoc = snap.docs[0];
      const challengeData = challengeDoc.data();
      const history = challengeData.history || [];
      if (history.length > 0 && history[history.length - 1] === oldItemId) {
        await updateDoc(doc(db, 'challenges', challengeDoc.id), {
          history: [...history, newItemId]
        });
        
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentScore = userSnap.data().tradeScore || 0;
          await updateDoc(userRef, { tradeScore: currentScore + 10 });
        }
      }
    }
  };

  const acceptOffer = async (tradeId: string, offererId: string, offeredItemId: string) => {
    try {
      // Update accepted trade
      await updateDoc(doc(db, 'trades', tradeId), { status: 'accepted' });
      
      // Reject other trades
      const otherOffers = auctionOffers.filter(o => o.id !== tradeId);
      for (const offer of otherOffers) {
        await updateDoc(doc(db, 'trades', offer.id), { status: 'rejected' });
      }

      // Update items status
      await updateDoc(doc(db, 'items', item.id), { status: 'traded' });
      await updateDoc(doc(db, 'items', offeredItemId), { status: 'traded' });

      // Update challenges
      await updateChallengeIfActive(item.ownerId, item.id, offeredItemId);
      await updateChallengeIfActive(offererId, offeredItemId, item.id);

      toast.success('¡Oferta aceptada! Revisa tus mensajes para coordinar.');
      navigate('/trades');
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error('Hubo un error al aceptar la oferta');
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
    <div className="pb-32 bg-neutral min-h-screen">
      <div className="relative aspect-square bg-surface">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="absolute top-6 left-6 z-10 bg-neutral/50 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/10 hover:bg-neutral/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        {item.isAuction && (
          <div className="absolute bottom-6 left-6 bg-tertiary text-neutral font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center text-xs">
            <Clock className="w-4 h-4 mr-2" />
            {timeLeft || 'Subasta Activa'}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-heading font-bold text-white leading-tight">{item.title}</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-primary/20 text-primary border border-primary/30">
            {item.condition === 'new' ? 'Nuevo' : item.condition === 'like-new' ? 'Como Nuevo' : item.condition === 'good' ? 'Buen Estado' : 'Aceptable'}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-surface text-gray-300 border border-white/5">
            <MapPin className="w-3 h-3 mr-1.5" />
            {item.location || 'Local'}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-surface text-gray-300 border border-white/5">
            <Clock className="w-3 h-3 mr-1.5" />
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
          </span>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Descripción</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
        </div>

        {item.lookingFor && (
          <div className="mb-8 bg-primary/10 p-5 rounded-[2rem] border border-primary/20">
            <h3 className="text-xs font-bold tracking-widest uppercase text-primary mb-2 flex items-center">
              <HeartHandshake className="w-4 h-4 mr-2" />
              Busca a cambio:
            </h3>
            <p className="text-gray-300 text-sm">{item.lookingFor}</p>
          </div>
        )}

        {isMyItem && item.isAuction && auctionOffers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-4">Ofertas de la Subasta</h3>
            <div className="space-y-4">
              {auctionOffers.map(offer => (
                <div key={offer.id} className="bg-surface border border-white/5 rounded-[2rem] p-5 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <img src={offer.offerer?.photoURL || `https://ui-avatars.com/api/?name=${offer.offerer?.displayName}&background=7C4DFF&color=fff`} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                    <div>
                      <p className="text-sm font-heading font-bold text-white">{offer.offerer?.displayName}</p>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-tertiary flex items-center mt-0.5">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {offer.offerer?.reputation || 5.0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mb-6 bg-neutral p-3 rounded-2xl border border-white/5">
                    <img src={offer.offeredItem?.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-heading font-bold text-white">{offer.offeredItem?.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{offer.offeredItem?.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => acceptOffer(offer.id, offer.offererId, offer.offeredItemId)}
                    className="w-full bg-primary text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(124,77,255,0.3)]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aceptar esta oferta
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {owner && !isMyItem && (
          <div className="border-t border-white/10 pt-8 mt-8">
            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Ofrecido por</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={owner.photoURL || `https://ui-avatars.com/api/?name=${owner.displayName}&background=7C4DFF&color=fff`} alt={owner.displayName} className="w-14 h-14 rounded-full border-2 border-surface-light" />
                <div>
                  <p className="font-heading font-bold text-white flex items-center text-lg">
                    {owner.displayName}
                    {owner.verified && <ShieldCheck className="w-5 h-5 text-primary ml-1.5" />}
                  </p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-tertiary flex items-center mt-1">
                    <Star className="w-3 h-3 mr-1 fill-current" /> {owner.reputation || 5.0} de reputación
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {!isMyItem && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-40">
          <div className="bg-surface/95 backdrop-blur-xl border border-white/10 p-3 rounded-[2.5rem] shadow-2xl flex space-x-3">
            <button 
              onClick={async () => {
                if (!user) {
                  toast.error('Debes iniciar sesión para chatear');
                  return;
                }
                const chatsRef = collection(db, 'chats');
                const q = query(chatsRef, where('participants', 'array-contains', user.uid));
                const snapshot = await getDocs(q);
                
                let existingChatId = null;
                snapshot.forEach(doc => {
                  const data = doc.data();
                  if (data.participants.includes(item.ownerId)) {
                    existingChatId = doc.id;
                  }
                });

                if (existingChatId) {
                  navigate(`/chat/${existingChatId}`);
                } else {
                  const newChatRef = doc(collection(db, 'chats'));
                  await setDoc(newChatRef, {
                    id: newChatRef.id,
                    participants: [user.uid, item.ownerId],
                    updatedAt: new Date().toISOString()
                  });
                  navigate(`/chat/${newChatRef.id}`);
                }
              }}
              className="flex-1 bg-surface-light text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5"
            >
              Chatear
            </button>
            <button 
              onClick={handleOfferClick}
              className="flex-[2] bg-primary text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(124,77,255,0.3)]"
            >
              {item.isAuction ? 'Participar en Subasta' : 'Ofrecer Trueque'}
            </button>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-neutral/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 overflow-hidden flex flex-col max-h-[80vh] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-heading font-bold text-white">Elige qué ofrecer</h3>
              <button
                onClick={() => setShowOfferModal(false)}
                aria-label="Cerrar"
                className="text-gray-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {myItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-6">No tienes artículos publicados para ofrecer.</p>
                  <button 
                    onClick={() => { setShowOfferModal(false); navigate('/add'); }}
                    className="bg-primary text-white text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(124,77,255,0.3)]"
                  >
                    Publicar un artículo ahora
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] mb-6">
                  {myItems.map(myItem => (
                    <label 
                      key={myItem.id} 
                      className={`flex items-center p-3 border rounded-2xl cursor-pointer transition-all ${selectedMyItem === myItem.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(124,77,255,0.1)]' : 'border-white/5 hover:bg-white/5'}`}
                    >
                      <input 
                        type="radio" 
                        name="myItem" 
                        value={myItem.id} 
                        checked={selectedMyItem === myItem.id}
                        onChange={() => setSelectedMyItem(myItem.id)}
                        className="sr-only"
                      />
                      <img src={myItem.imageUrl} alt={myItem.title} className="w-14 h-14 rounded-xl object-cover mr-4 border border-white/5" />
                      <div className="flex-1">
                        <p className="font-heading font-bold text-white text-sm">{myItem.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{myItem.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ml-3 ${selectedMyItem === myItem.id ? 'border-primary' : 'border-white/20'}`}>
                        {selectedMyItem === myItem.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {myItems.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-surface-light/50">
                <button
                  onClick={submitOffer}
                  disabled={!selectedMyItem}
                  className="w-full bg-primary text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(124,77,255,0.3)]"
                >
                  Enviar Oferta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
