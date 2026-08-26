// =============================================
// HARVEST BRIDGE — Real Leaflet Buyer Location Map
// Full Interactive OpenStreetMap & Satellite Map
// =============================================

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Package, DollarSign, Truck, Layers } from 'lucide-react';
import { DEMO_BUYERS } from '../data/demoData';
import { getCategoryLabel } from '../utils/format';
import type { Buyer } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  processor: '#2563eb',
  retailer: '#9333ea',
  restaurant: '#d97706',
  wholesaler: '#475569',
  institution: '16a34a',
  ngo: '#e11d48',
  school: '#0891b2',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  processor: '🏭',
  retailer: '🛒',
  restaurant: '🍽️',
  wholesaler: '📦',
  institution: '🏛️',
  ngo: '❤️',
  school: '🏫',
};

function createBuyerPin(category: string, isSelected: boolean) {
  const emoji = CATEGORY_EMOJIS[category] || '📍';
  return L.divIcon({
    className: 'custom-buyer-pin',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: ${isSelected ? '#0f172a' : '#ffffff'};
        border: 3px solid ${CATEGORY_COLORS[category] || '#16a34a'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transform: translate(-50%, -50%);
        transition: all 0.2s ease;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createFarmerPin() {
  return L.divIcon({
    className: 'custom-farmer-pin',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #15803d;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 14px rgba(21, 128, 61, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transform: translate(-50%, -50%);
      ">
        🌾
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function RecenterMap({ buyer }: { buyer: Buyer | null }) {
  const map = useMap();
  useEffect(() => {
    if (buyer) {
      map.flyTo([buyer.latitude, buyer.longitude], 11, { duration: 1.2 });
    }
  }, [buyer, map]);
  return null;
}

function BuyerCard({ buyer, selected, onClick }: { buyer: Buyer; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`card-hover cursor-pointer transition-all ${
        selected ? 'border-forest-600 bg-forest-50/60 shadow-sm' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{CATEGORY_EMOJIS[buyer.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 text-sm truncate">{buyer.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{getCategoryLabel(buyer.category)}</div>
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-1">
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            {buyer.district}
          </div>
        </div>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ background: CATEGORY_COLORS[buyer.category] || '#16a34a' }}
        />
      </div>
      {selected && (
        <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1">
          <div>Capacity: <strong className="text-slate-900">{buyer.capacity.toLocaleString()} kg</strong></div>
          <div>Target Price: <strong className="text-slate-900">₹{buyer.preferredPriceMin}–{buyer.preferredPriceMax}/kg</strong></div>
          {buyer.pickupAvailable && <div className="text-forest-700 font-semibold">✓ Logistics pickup available</div>}
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [mapLayer, setMapLayer] = useState<'osm' | 'topo' | 'satellite'>('osm');

  const categories = ['all', ...Array.from(new Set(DEMO_BUYERS.map((b) => b.category)))];
  const filtered = filterCategory === 'all' ? DEMO_BUYERS : DEMO_BUYERS.filter((b) => b.category === filterCategory);

  const farmerPos = { lat: 13.2000, lng: 78.7500 };

  const TILE_LAYERS = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-full animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-forest-600" />
            Regional Buyer Location Map
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real Leaflet map — Registered processors, institutions, FPOs, and retailers in Chittoor region
          </p>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <Layers className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mapLayer === 'osm' ? 'bg-forest-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mapLayer === 'satellite' ? 'bg-forest-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite View
            </button>
            <button
              onClick={() => setMapLayer('topo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mapLayer === 'topo' ? 'bg-forest-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Topography
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Left panel: Buyer Filters & List */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Category Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterCategory === cat
                    ? 'bg-forest-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Buyers' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Buyer list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filtered.map((buyer) => (
              <BuyerCard
                key={buyer._id}
                buyer={buyer}
                selected={selectedBuyer?._id === buyer._id}
                onClick={() => setSelectedBuyer(selectedBuyer?._id === buyer._id ? null : buyer)}
              />
            ))}
          </div>
        </div>

        {/* Right panel: Real Leaflet Map */}
        <div className="lg:col-span-2 h-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[450px]">
          <MapContainer
            center={[13.35, 78.9]}
            zoom={9}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', minHeight: '450px' }}
          >
            <TileLayer
              key={mapLayer}
              url={TILE_LAYERS[mapLayer].url}
              attribution={TILE_LAYERS[mapLayer].attribution}
            />
            <RecenterMap buyer={selectedBuyer} />

            {/* Farmer Pin */}
            <Marker position={[farmerPos.lat, farmerPos.lng]} icon={createFarmerPin()}>
              <Popup>
                <div className="p-1 font-bold text-xs text-slate-900">🌾 Your Farm Base</div>
              </Popup>
            </Marker>

            {/* Buyer Pins */}
            {filtered.map((buyer) => {
              const isSelected = selectedBuyer?._id === buyer._id;
              return (
                <Marker
                  key={buyer._id}
                  position={[buyer.latitude, buyer.longitude]}
                  icon={createBuyerPin(buyer.category, isSelected)}
                  eventHandlers={{
                    click: () => setSelectedBuyer(buyer),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span>{CATEGORY_EMOJIS[buyer.category]}</span>
                        {buyer.name}
                      </div>
                      <div className="text-slate-600">Category: {getCategoryLabel(buyer.category)}</div>
                      <div className="text-slate-600">Capacity: {buyer.capacity.toLocaleString()} kg</div>
                      <div className="text-slate-600">Target Price: ₹{buyer.preferredPriceMin}–{buyer.preferredPriceMax}/kg</div>
                      {buyer.pickupAvailable && <div className="text-forest-700 font-bold">✓ Pickup Available</div>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Selected buyer detail overlay card */}
          {selectedBuyer && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg z-[1000]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{CATEGORY_EMOJIS[selectedBuyer.category]}</span>
                <div className="font-bold text-slate-900 text-sm">{selectedBuyer.name}</div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium"><Package className="w-3.5 h-3.5 text-slate-500" />{selectedBuyer.capacity.toLocaleString()} kg capacity</span>
                <span className="flex items-center gap-1 font-medium"><DollarSign className="w-3.5 h-3.5 text-slate-500" />₹{selectedBuyer.preferredPriceMin}–{selectedBuyer.preferredPriceMax}/kg</span>
                {selectedBuyer.pickupAvailable && <span className="flex items-center gap-1 text-forest-700 font-bold"><Truck className="w-3.5 h-3.5 text-forest-600" />Pickup available</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
