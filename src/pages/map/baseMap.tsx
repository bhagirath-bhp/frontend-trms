
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Search, Navigation, ZoomIn, ZoomOut, Maximize2, Menu, Sidebar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setCenter,
  setZoom,
  setStyle,
  setLayerMenu,
  setSearchQuery,
  toggleLayerMenu,
} from '../../store/slices/mapSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomDrawer from '@/components/shared/CustomDrawer';
import { use } from 'i18next';

const BaseMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  let [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const {
    style: mapStyle,
    isLayerMenuOpen: showLayerMenu,
    searchQuery,
  } = useSelector((s: RootState) => s.map);

  const mapStyles: Record<string, { name: string; url: string }> = {
    streets: {
      name: 'Streets',
      url: 'https://demotiles.maplibre.org/style.json'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
    },
    terrain: {
      name: 'Terrain',
      url: 'https://api.maptiler.com/maps/outdoor/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
    }
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: mapStyles[mapStyle]?.url ?? mapStyles.streets.url,
      center: [72.5714, 23.0225], // initial center
      zoom: 12,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'top-right'
    );
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // sync map moves back to redux
    map.current.on('moveend', () => {
      const m = map.current!;
      const c = m.getCenter();
      dispatch(setCenter([parseFloat(c.lng.toFixed(6)), parseFloat(c.lat.toFixed(6))]));
      dispatch(setZoom(Number(m.getZoom().toFixed(2))));
    });
  }, [dispatch, mapStyle]);

  // apply style changes from redux to the map instance
  useEffect(() => {
    if (!map.current) return;
    const url = mapStyles[mapStyle]?.url;
    if (url) map.current.setStyle(url);
  }, [mapStyle]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  const handleFullscreen = () => {
    const el = mapContainer.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Search functionality would query: "${searchQuery}"`);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="relative w-full h-screen">
      
      <div ref={mapContainer} className="absolute inset-0" />

      
      <div className="absolute top-4 left-16  w-full max-w-xs px-4">
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for places..."
            className="w-full px-4 py-3 pl-10 pr-4 rounded-lg shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className='absolute top-4 left-4  w-full max-w-xs px-4 '>
        <Badge className='bg-white hover:bg-slate-200 text-gray-800 px-2 py-2 rounded-lg shadow-lg border-0' onClick={()=>setDrawerOpen(!drawerOpen)}>
         <Sidebar/>
        </Badge>
      </div>

     

      {/* Layer Switcher */}
      <div className="absolute bottom-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => dispatch(toggleLayerMenu())}
            className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            aria-expanded={showLayerMenu}
            aria-controls="layer-menu"
          >
            <Layers size={20} className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Layers</span>
          </Button>

          {showLayerMenu && (
            <div
              id="layer-menu"
              role="menu"
              className="absolute bottom-14 right-0 w-72 bg-white rounded-lg shadow-2xl p-3 ring-1 ring-black/5 mt-2"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">Map styles</span>
                </div>
                <button
                  aria-label="Close layer menu"
                  onClick={() => dispatch(setLayerMenu(false))}
                  className="text-gray-400 hover:text-gray-600 rounded-md p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {Object.entries(mapStyles).map(([key, style]) => {
                  const thumbStyle: React.CSSProperties =
                    key === 'streets'
                      ? { background: 'linear-gradient(135deg,#f8fafc,#dbeafe)' }
                      : key === 'satellite'
                      ? { background: 'linear-gradient(135deg,#e6f4ff,#d1fae5)' }
                      : { background: 'linear-gradient(135deg,#fff7ed,#fef3c7)' };

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        dispatch(setStyle(key));
                        dispatch(setLayerMenu(false));
                      }}
                      role="menuitem"
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors w-full text-left ${
                        mapStyle === key ? 'ring-1 ring-blue-300 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-16 h-10 rounded-md overflow-hidden flex-shrink-0 border" style={thumbStyle} aria-hidden />
                      <div className="flex-1">
                        <div className={`text-sm ${mapStyle === key ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                          {style.name}
                        </div>
                        <div className="text-xs text-gray-500">{key}</div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {mapStyle === key ? (
                          <span className="text-blue-600 font-bold">✓</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-200 block" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-gray-500">Tip: select a style to apply it instantly.</div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-32 right-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
          <ZoomOut size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Fullscreen Button */}
      <button onClick={handleFullscreen} className="absolute bottom-20 right-4 z-10 bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
        <Maximize2 size={20} className="text-gray-700" />
      </button>


      <CustomDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div>
          <p className="text-gray-600 mb-2">
            This drawer opens when you click on the map. You can use this space to display additional information
            about the clicked location.
          </p>
        </div>
      </CustomDrawer>
    </div>
  );
};


export default BaseMap;
