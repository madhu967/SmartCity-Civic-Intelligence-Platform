import { useEffect, useRef, useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Compass,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { HotspotRadarIcon } from './CivicIcons';
import { calculateDistanceKm } from '../utils/geolocation';

// 100% FREE, ZERO API KEY Tile Providers (No Carto, No Mapbox, No API keys required)
const TILE_PROVIDERS = {
  osm: {
    name: 'Street Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    isDark: false,
  },
  cleanLight: {
    name: 'Clean Light',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    isDark: false,
  },
  nightDark: {
    name: 'Night Dark',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    isDark: true,
  },
};

// Default Municipal Reference Center (New Delhi / Urban core)
const DEFAULT_MUNICIPAL_CENTER = { lat: 28.6139, lng: 77.2090, zoom: 13 };

// Pre-seeded municipal demonstration issues used if database has 0 reports
// Guarantees High, Medium, and Low hotspots are immediately visible and testable
const DEMO_HOTSPOT_ISSUES = [
  // High Hotspot Cluster 1: Central Metro Corridor (Roads & Infrastructure)
  { id: 'demo-1', category: 'Roads & Potholes', location: 'Central Metro Corridor, Pillar 42 (28.6250, 77.2150)', latitude: 28.6250, longitude: 77.2150, description: 'Multiple severe craters and damaged asphalt creating major accident risk.', priority: 'Critical', status: 'In progress', reportCount: 4, aiTitle: 'Multi-Pothole Road Failure' },
  { id: 'demo-2', category: 'Roads & Potholes', location: 'Central Metro Corridor, North Flyover (28.6270, 77.2180)', latitude: 28.6270, longitude: 77.2180, description: 'Deep road crack and expanding sinkhole near bus stop.', priority: 'High', status: 'Submitted', reportCount: 3, aiTitle: 'Expanding Road Sinkhole' },
  { id: 'demo-3', category: 'Roads & Potholes', location: 'Central Metro Corridor, Gate 3 (28.6240, 77.2130)', latitude: 28.6240, longitude: 77.2130, description: 'Broken road divider and loose paving stones.', priority: 'High', status: 'Submitted', reportCount: 2, aiTitle: 'Damaged Median Barrier' },
  { id: 'demo-4', category: 'Drainage', location: 'Central Metro Corridor, Drain 7 (28.6260, 77.2160)', latitude: 28.6260, longitude: 77.2160, description: 'Storm drain overflow flooding lower lane.', priority: 'Medium', status: 'In review', reportCount: 2, aiTitle: 'Storm Drain Overflow' },
  { id: 'demo-5', category: 'Roads & Potholes', location: 'Central Metro Corridor, Underpass (28.6235, 77.2145)', latitude: 28.6235, longitude: 77.2145, description: 'Exposed reinforcement iron rebar on underpass approach.', priority: 'Critical', status: 'Submitted', reportCount: 3, aiTitle: 'Exposed Road Rebar Hazard' },

  // High Hotspot Cluster 2: West Market Sector (Sanitation & Garbage)
  { id: 'demo-6', category: 'Garbage & Sanitation', location: 'West Market Sector, Wholesale Block (28.6020, 77.1950)', latitude: 28.6020, longitude: 77.1950, description: 'Massive uncollected garbage accumulation blocking pedestrian sidewalk.', priority: 'Critical', status: 'Submitted', reportCount: 5, aiTitle: 'Major Municipal Waste Pileup' },
  { id: 'demo-7', category: 'Garbage & Sanitation', location: 'West Market Sector, Vegetable Lane (28.6040, 77.1970)', latitude: 28.6040, longitude: 77.1970, description: 'Overflowing dumpsters spilling onto main street.', priority: 'High', status: 'In progress', reportCount: 4, aiTitle: 'Overflowing Commercial Dumpsters' },
  { id: 'demo-8', category: 'Garbage & Sanitation', location: 'West Market Sector, Gate 1 (28.6010, 77.1930)', latitude: 28.6010, longitude: 77.1930, description: 'Illegal plastic waste dumping in alleyway.', priority: 'Medium', status: 'Submitted', reportCount: 2, aiTitle: 'Commercial Dumping' },
  { id: 'demo-9', category: 'Drainage', location: 'West Market Sector, Service Lane (28.6030, 77.1960)', latitude: 28.6030, longitude: 77.1960, description: 'Blocked drain smelling foul and attracting pests.', priority: 'High', status: 'Submitted', reportCount: 3, aiTitle: 'Blocked Waste Channel' },

  // Medium Hotspot Cluster 3: East Residential Sector (Water Supply)
  { id: 'demo-10', category: 'Water Supply', location: 'East Sector 9, Main Line (28.6320, 77.2350)', latitude: 28.6320, longitude: 77.2350, description: 'High pressure drinking water pipe burst flooding road.', priority: 'High', status: 'Submitted', reportCount: 3, aiTitle: 'Burst Water Main Pipe' },
  { id: 'demo-11', category: 'Water Supply', location: 'East Sector 9, Block C (28.6340, 77.2380)', latitude: 28.6340, longitude: 77.2380, description: 'Low water pressure and contaminated supply in community.', priority: 'Medium', status: 'In review', reportCount: 2, aiTitle: 'Contaminated Water Supply' },
  { id: 'demo-12', category: 'Streetlights', location: 'East Sector 9, Outer Ring (28.6310, 77.2330)', latitude: 28.6310, longitude: 77.2330, description: 'Entire street light line unlit for 4 nights.', priority: 'Medium', status: 'Submitted', reportCount: 2, aiTitle: 'Dark Street Light Grid' },

  // Low Hotspot: Isolated Traffic incident
  { id: 'demo-13', category: 'Traffic', location: 'South Link Road (28.5850, 77.2200)', latitude: 28.5850, longitude: 77.2200, description: 'Broken traffic signal light stuck on red.', priority: 'Low', status: 'Submitted', reportCount: 1, aiTitle: 'Broken Traffic Light' },
  { id: 'demo-14', category: 'Electricity', location: 'Tech Park Avenue (28.6400, 77.1850)', latitude: 28.6400, longitude: 77.1850, description: 'Loose dangling wire from telephone pole.', priority: 'Medium', status: 'Resolved', reportCount: 1, aiTitle: 'Hanging Overhead Cable' },
];

/**
 * Extract or derive reliable geographic coordinates for any issue
 */
function resolveCoordinates(issue, index, baseCenter) {
  if (
    typeof issue.latitude === 'number' &&
    !isNaN(issue.latitude) &&
    typeof issue.longitude === 'number' &&
    !isNaN(issue.longitude) &&
    (issue.latitude !== 0 || issue.longitude !== 0)
  ) {
    return { lat: issue.latitude, lng: issue.longitude, derived: false };
  }

  // Check if coordinates are in issue.location string: "(lat, lng)"
  if (issue.location && typeof issue.location === 'string') {
    const match = issue.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, derived: false };
      }
    }
  }

  // Deterministic geographic offset based on ID or index around base municipal center
  const seed = (issue.id || issue._id || String(index))
    .toString()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const angle = (seed * 137.5 * Math.PI) / 180;
  const radius = ((seed % 35) + 5) * 0.0035; // ~300m to 1.5km spread
  return {
    lat: baseCenter.lat + Math.sin(angle) * radius,
    lng: baseCenter.lng + Math.cos(angle) * radius,
    derived: true,
  };
}

export default function AdminHotspotMap({ issues = [], workers = [], onUpdateIssue = null }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const heatLayerRef = useRef(null);
  const hotspotCirclesLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const workersLayerRef = useRef(null);

  // Check if window.L is ready (with active polling fallback)
  const [leafletReady, setLeafletReady] = useState(() => Boolean(typeof window !== 'undefined' && window.L));

  // UI state
  const [selectedDensity, setSelectedDensity] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tileStyle, setTileStyle] = useState('osm'); // Default: osm (100% Free, NO API KEY)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeIssue, setActiveIssue] = useState(null);

  // Layer toggles
  const [layerConfig, setLayerConfig] = useState({
    heatmap: true,
    hotspots: true,
    markers: true,
    workers: true,
  });

  // Ensure Leaflet is loaded (polling if CDN script is still downloading)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.L) {
      setLeafletReady(true);
      return;
    }

    const timer = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // Determine active issues dataset: use real issues from DB, or fallback to demo issues if DB has 0 issues
  const isUsingDemoData = issues.length === 0;
  const effectiveIssues = useMemo(() => {
    if (issues && issues.length > 0) return issues;
    return DEMO_HOTSPOT_ISSUES;
  }, [issues]);

  // Determine base reference center
  const baseCenter = useMemo(() => {
    const valid = effectiveIssues.filter(
      (i) => typeof i.latitude === 'number' && !isNaN(i.latitude) && i.latitude !== 0
    );
    if (valid.length > 0) {
      const avgLat = valid.reduce((sum, i) => sum + i.latitude, 0) / valid.length;
      const avgLng = valid.reduce((sum, i) => sum + i.longitude, 0) / valid.length;
      return { lat: avgLat, lng: avgLng, zoom: 13 };
    }
    return DEFAULT_MUNICIPAL_CENTER;
  }, [effectiveIssues]);

  // Geotag all issues
  const geotaggedIssues = useMemo(() => {
    return effectiveIssues.map((issue, idx) => {
      const coords = resolveCoordinates(issue, idx, baseCenter);
      return {
        ...issue,
        resolvedLat: coords.lat,
        resolvedLng: coords.lng,
        isDerivedCoordinate: coords.derived,
      };
    });
  }, [effectiveIssues, baseCenter]);

  // Filtered issues based on user selections
  const filteredIssues = useMemo(() => {
    return geotaggedIssues.filter((issue) => {
      if (selectedCategory !== 'ALL' && issue.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus === 'ACTIVE' && issue.status === 'Resolved') {
        return false;
      }
      if (selectedStatus === 'IN_PROGRESS' && issue.status !== 'In progress') {
        return false;
      }
      if (selectedStatus === 'RESOLVED' && issue.status !== 'Resolved') {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLocation = issue.location?.toLowerCase().includes(query);
        const matchesCategory = issue.category?.toLowerCase().includes(query);
        const matchesDesc = issue.description?.toLowerCase().includes(query);
        const matchesAi = (issue.aiTitle || issue.aiSummary)?.toLowerCase().includes(query);
        if (!matchesLocation && !matchesCategory && !matchesDesc && !matchesAi) {
          return false;
        }
      }
      return true;
    });
  }, [geotaggedIssues, selectedCategory, selectedStatus, searchQuery]);

  // Geospatial Clustering Algorithm -> Compute Hotspot Zones
  const hotspotClusters = useMemo(() => {
    const CLUSTER_DISTANCE_KM = 1.1; // Hotspot spatial aggregation window (~1.1 km)
    const clusters = [];

    filteredIssues.forEach((issue) => {
      let assignedCluster = null;
      let minDistance = Infinity;

      for (const cluster of clusters) {
        const dist = calculateDistanceKm(
          cluster.centroidLat,
          cluster.centroidLng,
          issue.resolvedLat,
          issue.resolvedLng
        );
        if (dist !== null && dist <= CLUSTER_DISTANCE_KM && dist < minDistance) {
          minDistance = dist;
          assignedCluster = cluster;
        }
      }

      if (assignedCluster) {
        assignedCluster.issues.push(issue);
        const n = assignedCluster.issues.length;
        assignedCluster.centroidLat =
          (assignedCluster.centroidLat * (n - 1) + issue.resolvedLat) / n;
        assignedCluster.centroidLng =
          (assignedCluster.centroidLng * (n - 1) + issue.resolvedLng) / n;
      } else {
        clusters.push({
          id: `cluster-${clusters.length + 1}`,
          centroidLat: issue.resolvedLat,
          centroidLng: issue.resolvedLng,
          issues: [issue],
        });
      }
    });

    // Score & classify each cluster into High, Medium, Low
    return clusters.map((cluster, index) => {
      const issuesInCluster = cluster.issues;
      const count = issuesInCluster.length;
      const totalCitizenReports = issuesInCluster.reduce(
        (sum, i) => sum + (i.reportCount || 1),
        0
      );

      const criticalCount = issuesInCluster.filter((i) => i.priority === 'Critical').length;
      const highCount = issuesInCluster.filter((i) => i.priority === 'High').length;
      const mediumCount = issuesInCluster.filter((i) => i.priority === 'Medium').length;
      const lowCount = issuesInCluster.filter((i) => i.priority === 'Low').length;
      const unresolvedCount = issuesInCluster.filter((i) => i.status !== 'Resolved').length;

      // Weighted severity calculation
      const severityScore =
        criticalCount * 4 +
        highCount * 3 +
        mediumCount * 2 +
        lowCount * 1 +
        unresolvedCount * 2 +
        (totalCitizenReports - count);

      // Classification
      let densityLevel = 'LOW';
      if (count >= 4 || severityScore >= 10 || criticalCount >= 1) {
        densityLevel = 'HIGH';
      } else if (count >= 2 || severityScore >= 4) {
        densityLevel = 'MEDIUM';
      }

      // Dominant category
      const categoryCounts = issuesInCluster.reduce((acc, i) => {
        const cat = i.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      const dominantCategory =
        Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Civic Issue';

      // Representative location name
      const sampleLocation =
        issuesInCluster.find((i) => i.location && !i.location.startsWith('('))?.location ||
        `Municipal Sector Zone #${index + 1}`;

      // Visual radius
      const radiusMeters =
        densityLevel === 'HIGH'
          ? Math.max(550, Math.min(1500, count * 190))
          : densityLevel === 'MEDIUM'
          ? Math.max(380, Math.min(950, count * 160))
          : 280;

      return {
        ...cluster,
        index: index + 1,
        name: sampleLocation,
        densityLevel,
        severityScore,
        count,
        totalCitizenReports,
        criticalCount,
        highCount,
        unresolvedCount,
        dominantCategory,
        radiusMeters,
      };
    });
  }, [filteredIssues]);

  // Apply density filter to clusters
  const displayedClusters = useMemo(() => {
    if (selectedDensity === 'ALL') return hotspotClusters;
    return hotspotClusters.filter((c) => c.densityLevel === selectedDensity);
  }, [hotspotClusters, selectedDensity]);

  // Macro metrics
  const stats = useMemo(() => {
    const total = hotspotClusters.length;
    const high = hotspotClusters.filter((c) => c.densityLevel === 'HIGH').length;
    const medium = hotspotClusters.filter((c) => c.densityLevel === 'MEDIUM').length;
    const low = hotspotClusters.filter((c) => c.densityLevel === 'LOW').length;
    const unresolvedIssues = filteredIssues.filter((i) => i.status !== 'Resolved').length;
    return { total, high, medium, low, unresolvedIssues };
  }, [hotspotClusters, filteredIssues]);

  // Initialize Leaflet Map ONCE (does NOT re-trigger on tileStyle change)
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    // Remove existing map if already present
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [baseCenter.lat, baseCenter.lng],
      zoom: baseCenter.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial base tile layer
    const activeTile = TILE_PROVIDERS[tileStyle] || TILE_PROVIDERS.osm;
    const tileLayer = L.tileLayer(activeTile.url, {
      maxZoom: activeTile.maxZoom,
      subdomains: 'abc',
      attribution: activeTile.attribution,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups
    const hotspotsGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const workersGroup = L.layerGroup().addTo(map);

    leafletMapRef.current = map;
    hotspotCirclesLayerRef.current = hotspotsGroup;
    markersLayerRef.current = markersGroup;
    workersLayerRef.current = workersGroup;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [leafletReady, baseCenter]);

  // Update Tile Style WITHOUT recreating the map (preserves all hotspots and markers!)
  useEffect(() => {
    const tileLayer = tileLayerRef.current;
    const map = leafletMapRef.current;
    if (!tileLayer || !map) return;

    const activeTile = TILE_PROVIDERS[tileStyle] || TILE_PROVIDERS.osm;
    tileLayer.setUrl(activeTile.url);

    const container = map.getContainer();
    if (activeTile.isDark) {
      container.classList.add('leaflet-dark-mode');
    } else {
      container.classList.remove('leaflet-dark-mode');
    }
  }, [tileStyle]);

  // Update Heatmap Layer
  useEffect(() => {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map || !L) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!layerConfig.heatmap || filteredIssues.length === 0) return;

    const heatPoints = filteredIssues.map((issue) => {
      let weight = 0.5;
      if (issue.priority === 'Critical') weight = 1.0;
      else if (issue.priority === 'High') weight = 0.8;
      else if (issue.priority === 'Medium') weight = 0.55;
      else weight = 0.35;

      if ((issue.reportCount || 1) > 1) {
        weight = Math.min(1.0, weight + (issue.reportCount - 1) * 0.1);
      }
      return [issue.resolvedLat, issue.resolvedLng, weight];
    });

    if (typeof L.heatLayer === 'function') {
      try {
        const heatLayer = L.heatLayer(heatPoints, {
          radius: 28,
          blur: 20,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.15: '#2563eb', // Blue
            0.4: '#10b981',  // Green
            0.65: '#f59e0b', // Amber
            0.85: '#f97316', // Orange
            1.0: '#ef4444',  // Crimson Red
          },
        });
        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
      } catch (err) {
        console.warn('Leaflet heatLayer error:', err);
      }
    }
  }, [filteredIssues, layerConfig.heatmap, leafletReady]);

  // Update Hotspot Risk Zones & Indicator Circles
  useEffect(() => {
    const L = window.L;
    const map = leafletMapRef.current;
    const hotspotsGroup = hotspotCirclesLayerRef.current;
    if (!map || !L || !hotspotsGroup) return;

    hotspotsGroup.clearLayers();

    if (!layerConfig.hotspots) return;

    displayedClusters.forEach((cluster) => {
      const isHigh = cluster.densityLevel === 'HIGH';
      const isMed = cluster.densityLevel === 'MEDIUM';

      const strokeColor = isHigh ? '#dc2626' : isMed ? '#d97706' : '#059669';
      const fillColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';
      const fillOpacity = isHigh ? 0.3 : isMed ? 0.22 : 0.15;

      // Outer pulsing aura circle
      const auraCircle = L.circle([cluster.centroidLat, cluster.centroidLng], {
        radius: cluster.radiusMeters,
        color: strokeColor,
        weight: isHigh ? 2.5 : 1.8,
        dashArray: isHigh ? '6, 6' : null,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        className: isHigh ? 'hotspot-pulse-high' : isMed ? 'hotspot-pulse-med' : '',
      });

      // Centroid Hotspot Badge DivIcon
      const badgeHtml = `
        <div class="hotspot-badge-marker hotspot-badge-${cluster.densityLevel.toLowerCase()}">
          <span class="hotspot-badge-dot"></span>
          <span class="hotspot-badge-count">${cluster.count}</span>
        </div>
      `;

      const badgeIcon = L.divIcon({
        html: badgeHtml,
        className: 'hotspot-custom-div-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const badgeMarker = L.marker([cluster.centroidLat, cluster.centroidLng], {
        icon: badgeIcon,
      });

      const popupHtml = `
        <div class="hotspot-popup-card">
          <div class="hotspot-popup-header">
            <span class="hotspot-level-tag hotspot-level-${cluster.densityLevel.toLowerCase()}">
              ${cluster.densityLevel} CONCENTRATION
            </span>
            <span class="hotspot-popup-count">${cluster.count} issues</span>
          </div>
          <h4 class="hotspot-popup-title">${cluster.name}</h4>
          <p class="hotspot-popup-desc">
            Dominant Issue: <strong>${cluster.dominantCategory}</strong>
          </p>
          <div class="hotspot-popup-stats">
            <div><span>Reports</span><strong>${cluster.totalCitizenReports}</strong></div>
            <div><span>Critical</span><strong>${cluster.criticalCount}</strong></div>
            <div><span>Pending</span><strong>${cluster.unresolvedCount}</strong></div>
          </div>
        </div>
      `;

      auraCircle.bindPopup(popupHtml, { maxWidth: 300 });
      badgeMarker.bindPopup(popupHtml, { maxWidth: 300 });

      const handleClick = () => {
        setActiveHotspot(cluster);
      };
      auraCircle.on('click', handleClick);
      badgeMarker.on('click', handleClick);

      auraCircle.addTo(hotspotsGroup);
      badgeMarker.addTo(hotspotsGroup);
    });
  }, [displayedClusters, layerConfig.hotspots, leafletReady]);

  // Update Individual Issue Markers
  useEffect(() => {
    const L = window.L;
    const map = leafletMapRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !L || !markersGroup) return;

    markersGroup.clearLayers();

    if (!layerConfig.markers) return;

    filteredIssues.forEach((issue) => {
      const isCritical = issue.priority === 'Critical';
      const isHigh = issue.priority === 'High';
      const isResolved = issue.status === 'Resolved';

      const color = isResolved
        ? '#10b981'
        : isCritical
        ? '#ef4444'
        : isHigh
        ? '#f97316'
        : '#3b82f6';

      const markerHtml = `
        <div class="issue-map-pin ${isCritical ? 'issue-pin-critical' : ''}" style="--pin-color: ${color}">
          <div class="issue-pin-inner"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'issue-pin-div',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([issue.resolvedLat, issue.resolvedLng], {
        icon: customIcon,
      });

      const popupContent = `
        <div class="issue-marker-popup">
          <div class="issue-marker-badge" style="background: ${color}20; color: ${color};">
            ${issue.category} · ${issue.priority}
          </div>
          <h4 class="issue-marker-title">${issue.aiTitle || issue.description?.slice(0, 50)}</h4>
          <p class="issue-marker-loc">${issue.location}</p>
          <div class="issue-marker-meta">
            <span>Status: <strong>${issue.status}</strong></span>
            <span>Reports: <strong>${issue.reportCount || 1}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });
      marker.on('click', () => {
        setActiveIssue(issue);
      });

      marker.addTo(markersGroup);
    });
  }, [filteredIssues, layerConfig.markers, leafletReady]);

  // Update Worker Locations Layer
  useEffect(() => {
    const L = window.L;
    const map = leafletMapRef.current;
    const workersGroup = workersLayerRef.current;
    if (!map || !L || !workersGroup) return;

    workersGroup.clearLayers();

    if (!layerConfig.workers || workers.length === 0) return;

    workers.forEach((worker, idx) => {
      let wLat = worker.latitude;
      let wLng = worker.longitude;

      if (!wLat || !wLng || isNaN(wLat) || isNaN(wLng)) {
        const seed = (worker.id || worker._id || idx)
          .toString()
          .split('')
          .reduce((a, c) => a + c.charCodeAt(0), 0);
        const angle = (seed * 211 * Math.PI) / 180;
        const radius = ((seed % 20) + 4) * 0.004;
        wLat = baseCenter.lat + Math.sin(angle) * radius;
        wLng = baseCenter.lng + Math.cos(angle) * radius;
      }

      const isAvailable = worker.availability !== 'Unavailable';
      const markerHtml = `
        <div class="worker-map-pin ${isAvailable ? 'worker-pin-available' : 'worker-pin-busy'}">
          <span class="worker-pin-badge">👷</span>
        </div>
      `;

      const workerIcon = L.divIcon({
        html: markerHtml,
        className: 'worker-custom-div-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([wLat, wLng], { icon: workerIcon });

      const popupContent = `
        <div class="worker-marker-popup">
          <p class="worker-popup-tag">${worker.department || 'Field Crew'}</p>
          <h4>${worker.name}</h4>
          <p class="worker-popup-status">Status: <strong>${worker.availability || 'Available'}</strong></p>
          <p class="worker-popup-workload">Active Tasks: <strong>${worker.activeIssuesCount || 0}</strong></p>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 240 });
      marker.addTo(workersGroup);
    });
  }, [workers, layerConfig.workers, baseCenter, leafletReady]);

  // Fly to cluster on click from sidebar feed
  const handleFocusCluster = (cluster) => {
    setActiveHotspot(cluster);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([cluster.centroidLat, cluster.centroidLng], 15, {
        duration: 1.2,
      });
    }
  };

  // Reset map view
  const handleResetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([baseCenter.lat, baseCenter.lng], baseCenter.zoom, {
        duration: 1.0,
      });
    }
    setActiveHotspot(null);
    setActiveIssue(null);
  };

  return (
    <div className={`hotspot-map-container ${isFullscreen ? 'hotspot-fullscreen' : ''}`}>
      {/* Informational banner if using demonstration hotspot data */}
      {isUsingDemoData && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-blue-600 animate-pulse shrink-0" />
            <span>
              <strong>Demonstration Hotspot Intelligence Active:</strong> Visualizing 14 municipal problem concentration zones. Real citizen reports will automatically replace this data once submitted.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Demo Mode
          </span>
        </div>
      )}

      {/* 1. TOP STATS BAR - High, Medium, Low Indication */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="hotspot-kpi-card border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hotspots</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Compass size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">active clusters</span>
          </div>
        </div>

        {/* HIGH DENSITY INDICATION */}
        <div
          onClick={() => setSelectedDensity(selectedDensity === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`hotspot-kpi-card cursor-pointer transition-all border-red-200 bg-linear-to-br from-red-50/50 to-white hover:border-red-400 ${
            selectedDensity === 'HIGH' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
              <HotspotRadarIcon size={14} className="text-red-600" /> High Density
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{stats.high}</span>
            <span className="text-xs text-red-600/80 font-medium">urgent hotspots</span>
          </div>
        </div>

        {/* MEDIUM DENSITY INDICATION */}
        <div
          onClick={() => setSelectedDensity(selectedDensity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`hotspot-kpi-card cursor-pointer transition-all border-amber-200 bg-linear-to-br from-amber-50/50 to-white hover:border-amber-400 ${
            selectedDensity === 'MEDIUM' ? 'ring-2 ring-amber-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle size={14} className="text-amber-600" /> Medium Density
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{stats.medium}</span>
            <span className="text-xs text-amber-600/80 font-medium">moderate zones</span>
          </div>
        </div>

        {/* LOW DENSITY INDICATION */}
        <div
          onClick={() => setSelectedDensity(selectedDensity === 'LOW' ? 'ALL' : 'LOW')}
          className={`hotspot-kpi-card cursor-pointer transition-all border-emerald-200 bg-linear-to-br from-emerald-50/50 to-white hover:border-emerald-400 ${
            selectedDensity === 'LOW' ? 'ring-2 ring-emerald-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-600" /> Low Density
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.low}</span>
            <span className="text-xs text-emerald-600/80 font-medium">isolated points</span>
          </div>
        </div>

        {/* GEOTAGGED TOTAL */}
        <div className="hotspot-kpi-card border-slate-200 bg-white shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mapped Incidents</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <MapPin size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{filteredIssues.length}</span>
            <span className="text-xs text-slate-500 font-medium">
              {stats.unresolvedIssues} pending
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & CONTROL TOOLBAR */}
      <div className="hotspot-toolbar">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search area, category, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hotspot-input pl-8.5 pr-3 py-1.5 text-xs w-full rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="hotspot-select text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Civic Categories</option>
            <option value="Roads & Potholes">Roads & Potholes</option>
            <option value="Garbage & Sanitation">Garbage & Sanitation</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Electricity">Electricity</option>
            <option value="Streetlights">Streetlights</option>
            <option value="Drainage">Drainage</option>
            <option value="Traffic">Traffic</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="hotspot-select text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Unresolved / Active Only</option>
            <option value="IN_PROGRESS">In Field Work</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          {/* Density Filter Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedDensity(lvl)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  selectedDensity === lvl
                    ? lvl === 'HIGH'
                      ? 'bg-red-600 text-white shadow-xs'
                      : lvl === 'MEDIUM'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : lvl === 'LOW'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'ALL' ? 'All Densities' : `${lvl.charAt(0) + lvl.slice(1).toLowerCase()}`}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Toggles & Map Options */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLayerConfig((prev) => ({ ...prev, heatmap: !prev.heatmap }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                layerConfig.heatmap
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Toggle continuous heat intensity gradient"
            >
              <HotspotRadarIcon size={12} /> Heatmap
            </button>

            <button
              type="button"
              onClick={() => setLayerConfig((prev) => ({ ...prev, hotspots: !prev.hotspots }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                layerConfig.hotspots
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Toggle problem density zones & cluster circles"
            >
              <Radio size={12} /> Hotspots
            </button>

            <button
              type="button"
              onClick={() => setLayerConfig((prev) => ({ ...prev, markers: !prev.markers }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                layerConfig.markers
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Toggle individual incident pins"
            >
              <MapPin size={12} /> Pins
            </button>

            <button
              type="button"
              onClick={() => setLayerConfig((prev) => ({ ...prev, workers: !prev.workers }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                layerConfig.workers
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Toggle field worker locations for dispatch"
            >
              <ShieldCheck size={12} /> Crews
            </button>
          </div>

          {/* Zero API Key Tile Style Picker */}
          <select
            value={tileStyle}
            onChange={(e) => setTileStyle(e.target.value)}
            className="text-xs py-1.5 px-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            title="Switch map visual theme (100% Free - No API Key Required)"
          >
            <option value="osm">Street Map</option>
            <option value="cleanLight">Clean Light</option>
            <option value="nightDark">Night Dark</option>
          </select>

          {/* Reset View */}
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Reset Map View"
          >
            <RefreshCw size={14} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* 3. DUAL-PANE WORKSPACE: INTERACTIVE MAP + HOTSPOT FEED */}
      <div className="hotspot-grid-layout">
        {/* MAP CONTAINER */}
        <div className="hotspot-map-wrapper">
          <div ref={mapContainerRef} className="hotspot-leaflet-map" />

          {/* Map Legend Overlay */}
          <div className="hotspot-map-legend">
            <div className="flex items-center gap-1.5 mb-1.5 font-bold text-[11px] text-slate-800">
              <Layers size={13} /> Density Legend
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-red-200"></span>
                <span>High Hotspot (Urgent / 4+ issues)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
                <span>Medium Density (2-3 issues)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                <span>Low Density (Isolated)</span>
              </div>
              <div className="flex items-center gap-2 pt-0.5 border-t border-slate-100">
                <span className="text-[12px]">👷</span>
                <span>Municipal Crew Position</span>
              </div>
            </div>
          </div>
        </div>

        {/* HOTSPOT INTELLIGENCE FEED */}
        <div className="hotspot-feed-panel">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <HotspotRadarIcon size={15} className="text-red-500" /> Hotspot Priority Feed
              </h3>
              <p className="text-[11px] text-slate-500">
                {displayedClusters.length} concentration areas active
              </p>
            </div>
            {activeHotspot && (
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
              >
                Clear focus <X size={12} />
              </button>
            )}
          </div>

          <div className="hotspot-feed-list">
            {displayedClusters.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MapPin size={24} className="mx-auto mb-2 text-slate-300" />
                No problem hotspots match the current filter criteria.
              </div>
            ) : (
              displayedClusters.map((cluster) => {
                const isSelected = activeHotspot?.id === cluster.id;
                const isHigh = cluster.densityLevel === 'HIGH';
                const isMed = cluster.densityLevel === 'MEDIUM';

                return (
                  <div
                    key={cluster.id}
                    onClick={() => handleFocusCluster(cluster)}
                    className={`hotspot-feed-card transition-all cursor-pointer ${
                      isSelected
                        ? 'hotspot-feed-card-selected'
                        : isHigh
                        ? 'hover:border-red-300'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isHigh
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isMed
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {cluster.densityLevel}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {cluster.dominantCategory}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {cluster.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{cluster.count} incident reports</span>
                          <span>·</span>
                          <span className="text-red-600 font-semibold">
                            {cluster.criticalCount > 0 ? `${cluster.criticalCount} critical` : 'Standard'}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocusCluster(cluster);
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition shrink-0"
                        title="Focus on map"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>

                    {/* Expanded issues inside selected cluster */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Issues in this Hotspot:
                        </p>
                        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                          {cluster.issues.map((iss) => (
                            <div
                              key={iss.id || iss._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveIssue(iss);
                              }}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs transition flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">
                                  {iss.aiTitle || iss.description}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {iss.category} · Priority: {iss.priority} · Status: {iss.status}
                                </p>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                  iss.status === 'Resolved'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {iss.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. ACTIVE ISSUE INSPECTOR MODAL */}
      {activeIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setActiveIssue(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {activeIssue.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeIssue.priority === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : activeIssue.priority === 'High'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {activeIssue.priority} Priority
              </span>
              <span className="text-xs text-slate-500">
                Status: <strong>{activeIssue.status}</strong>
              </span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {activeIssue.aiTitle || activeIssue.description?.slice(0, 70)}
            </h3>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {activeIssue.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-blue-500" /> {activeIssue.location}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reports / Citizen Duplicates</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {activeIssue.reportCount || 1} citizens reported
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Worker</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {activeIssue.assignedWorker?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {new Date(activeIssue.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            {activeIssue.imageUrl && (
              <div className="mb-4">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Evidence Photo</span>
                <img
                  src={activeIssue.imageUrl}
                  alt="Issue visual evidence"
                  className="w-full h-40 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <a
                href="/admin/issues"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Open in Issues Dashboard
              </a>
              <button
                type="button"
                onClick={() => setActiveIssue(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
