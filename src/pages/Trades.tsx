import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowRightLeft } from 'lucide-react';

export default function Trades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'trades'),
          or(
            where('offererId', '==', user.uid),
            where('targetOwnerId', '==', user.uid)
          )
        );
        const snapshot = await getDocs(q);
        setTrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching trades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Trueques</h2>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : trades.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
          <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes trueques activos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map(trade => {
            const isMyOffer = trade.offererId === user.uid;
            return (
              <div key={trade.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    trade.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    trade.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    trade.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {trade.status === 'pending' ? 'Pendiente' : trade.status === 'accepted' ? 'Aceptado' : trade.status === 'completed' ? 'Completado' : 'Rechazado'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isMyOffer ? 'Tú ofreciste' : 'Te ofrecieron'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 truncate flex-1">
                    {isMyOffer ? 'Tu artículo' : 'Su artículo'}
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                  <div className="text-sm font-medium text-gray-900 truncate flex-1 text-right">
                    {isMyOffer ? 'Su artículo' : 'Tu artículo'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
