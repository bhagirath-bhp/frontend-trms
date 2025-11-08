import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Search, ZoomIn, ZoomOut, Maximize2, Sidebar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Latlng, Territory, getMapLocations, getTerritoryByLatLng } from '../../apis/apiService';
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
import Searchinput from './component/Searchinput';
import GlobalLoader from '@/components/shared/GlobalLoader';

const BaseMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [territory, setTerritory] = useState<Territory | null>(null);


  const dispatch = useDispatch<AppDispatch>();
  const { style: mapStyle, isLayerMenuOpen: showLayerMenu, searchQuery } = useSelector((s: RootState) => s.map);

  const mapStyles: Record<string, { name: string; url: string }> = {
    streets: { name: 'Streets', url: 'https://demotiles.maplibre.org/style.json' },
    satellite: { name: 'Satellite', url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL' },
    terrain: { name: 'Terrain', url: 'https://api.maptiler.com/maps/outdoor/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL' }
  };

  const removeDefaultLabels = () => {
    const m = map.current;
    if (!m) return;

    m.getStyle().layers?.forEach((layer) => {
      if (layer.type === 'symbol' && layer.id !== 'territories-labels') {
        m.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
  };

  const loadAllTerritoryPoints = async () => {
    const m = map.current;
    if (!m) return;

    const items = await getMapLocations();

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: items.map((t) => ({
        type: 'Feature',
        properties: { name: t.name },
        geometry: t.center
      }))
    };

    const src = m.getSource('territories') as maplibregl.GeoJSONSource;
    if (src) src.setData(geojson);
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: mapStyles[mapStyle]?.url ?? mapStyles.streets.url,
      center: [72.5714, 23.0225],
      zoom: 12,
      attributionControl: false,
    });

    map.current.on('styledata', () => {
      removeDefaultLabels();
      loadAllTerritoryPoints();
    });

    map.current.on('load', () => {
      const m = map.current;
      if (!m) return;

      // territory points
      m.addSource('territories', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // badge-like label layer
      m.addLayer({
        id: 'territories-labels',
        type: 'symbol',
        source: 'territories',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 15,
          'text-justify': 'center',
          'text-padding': 8,
          'text-letter-spacing': 0.05,
          'text-font': ['Noto Sans']
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#1f2937',
          'text-halo-width': 2
        }
      });

      // single polygon selection source
      m.addSource('selected-territory', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // fill layer
      m.addLayer({
        id: 'selected-territory-fill',
        type: 'fill',
        source: 'selected-territory',
        paint: {
          'fill-color': '#2563eb',
          'fill-opacity': 0.25,
        }
      });

      // outline layer
      m.addLayer({
        id: 'selected-territory-line',
        type: 'line',
        source: 'selected-territory',
        paint: {
          'line-color': '#1e40af',
          'line-width': 3
        }
      });

      loadAllTerritoryPoints();
      addMapClickListener();
    });

    // controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      'top-right'
    );
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.current.on('moveend', () => {
      const m = map.current!;
      const c = m.getCenter();
      dispatch(setCenter([+c.lng.toFixed(6), +c.lat.toFixed(6)]));
      dispatch(setZoom(+m.getZoom().toFixed(2)));
    });
  }, [dispatch, mapStyle]);

  // -------------------------------------------
  // SINGLE SELECTION
  // -------------------------------------------
  const addMapClickListener = () => {
    const m = map.current;
    if (!m) return;

    m.on('click', async (e) => {
      setLoading(true);

      try {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;

        const territory = await getTerritoryByLatLng(lng, lat);
        setTerritory(territory);

        if (!territory?.geometry) {
          clearPolygon();
          setDrawerOpen(false);
          return;
        }

        if (territory?.geometry) {
          plotPolygon(territory.geometry);
        }
      } finally {
        setLoading(false);
      }
    });

  };

  const plotPolygon = (geometry: any) => {
    const m = map.current;
    if (!m || !geometry) return;

    const src = m.getSource('selected-territory') as maplibregl.GeoJSONSource;
    src.setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry, properties: {} }]
    });

    const bounds = new maplibregl.LngLatBounds();
    geometry.coordinates[0].forEach(([lng, lat]) => bounds.extend([lng, lat]));
    m.fitBounds(bounds, { padding: 40, duration: 500 });
    setDrawerOpen(true);
  };

  const handleFullscreen = () => { const el = mapContainer.current; if (!el) return; if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen(); };

  const clearPolygon = () => {
    const m = map.current;
    if (!m) return;

    const src = m.getSource('selected-territory') as maplibregl.GeoJSONSource;
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  };


  // style changes applied instantly
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapStyles[mapStyle]?.url);
  }, [mapStyle]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();


  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      // Example: Using OpenCage Geocoder (replace with your geocoding service)
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=YOUR_API_KEY`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;

        // Pan the map to the searched location
        map.current?.flyTo({ center: [lng, lat], zoom: 14 });

        // Update Redux state
        dispatch(setCenter([lng, lat]));
      } else {
        map.current?.flyTo({
          center: [72.6049247, 23.013302], // Target coordinates
          zoom: 14, // Target zoom level
          speed: 0.8, // Animation speed (default is 1.2, lower is slower)
          curve: 1.5, // Path curvature (default is 1.42, higher is more curved)
          easing: (t) => t, // Easing function (default is linear)
          essential: true, // If true, animation is considered essential for accessibility
        });
        // alert('Location not found. Please try again.');
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
      alert('Failed to fetch location. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-16  z-20 w-full max-w-xs px-4">
        <Searchinput onSearch={handleSearch} />
      </div>

      <div className='absolute top-4 left-4  w-full max-w-xs px-4 '>
     
      <GlobalLoader active={loading} />

      <div ref={mapContainer} className="absolute inset-0" />

      {/* Search bar */}
      <div className="absolute top-4 left-16 z-20 w-full max-w-xs px-4">
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search for places..."
            className="w-full px-4 py-3 pl-10 rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Drawer trigger */}
      <div className="absolute top-4 left-4 w-full max-w-xs px-4">
        <Badge className="bg-white hover:bg-slate-200 text-gray-800 px-2 py-2 rounded-lg shadow-lg"
          onClick={() => setDrawerOpen(!drawerOpen)}>
          <Sidebar />
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
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors w-full text-left ${mapStyle === key ? 'ring-1 ring-blue-300 bg-blue-50' : 'hover:bg-gray-50'
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
      <div className="absolute bottom-32 right-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50">
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50">
          <ZoomOut size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Fullscreen */}
      <button
        onClick={handleFullscreen}
        className="absolute bottom-20 right-4 z-10 bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50"
      >
        <Maximize2 size={20} className="text-gray-700" />
      </button>

      <CustomDrawer handleSearch={handleSearch} open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="text-gray-600 mb-2">Click the map to load a territory polygon.</div>
      </CustomDrawer>
    </div>
    </div>
  )}

export default BaseMap;

