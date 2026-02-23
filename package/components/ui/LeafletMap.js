import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const BASE_MAP_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      #map { border-radius: 12px; }
      .leaflet-popup-content-wrapper {
        background: #fff;
        color: #111;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
      .custom-pin-icon {
        background: transparent;
        border: 0;
      }
      .custom-pin {
        width: 30px;
        height: 42px;
        position: relative;
      }
      .custom-pin-head {
        position: absolute;
        top: 0;
        left: 5px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        border: 2px solid rgba(255,255,255,0.9);

        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
        line-height: 1;
        font-weight: 700;
      }
      .custom-pin-tail {
        position: absolute;
        top: 19px;
        left: 12px;
        width: 0;
        height: 0;
        border-left: 3px solid transparent;
        border-right: 3px solid transparent;
        border-top-width: 12px;
        border-top-style: solid;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map("map", {
        zoomControl: true,
        dragging: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        tap: true,
      }).setView([8.9486, 125.5406], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "OpenStreetMap contributors",
      }).addTo(map);

      const markerLayerGroup = L.layerGroup().addTo(map);
      let routeLayer = null;
      let fallbackMarker = null;
      let handleMapClick = null;
      let handleFallbackDrag = null;

      const sendMessage = (payload) => {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      };

      const createMarkerIcon = (item, fallbackColor) => {
        const markerColor = item.color || fallbackColor || "#2563EB";
        const iconType = item.iconType || "";
        const iconGlyph = iconType === "evac_center" ? "🏠" : "📍";

        return L.divIcon({
          className: "custom-pin-icon",
          html:
            '<div class="custom-pin">' +
              '<div class="custom-pin-head" style="background:' + markerColor + ';">' + iconGlyph + '</div>' +
              '<div class="custom-pin-tail" style="border-top-color:' + markerColor + ';"></div>' +
            "</div>",
          iconSize: [30, 42],
          iconAnchor: [15, 41],
          popupAnchor: [0, -34],
        });
      };

      const setArchiveMode = (isArchive) => {
        if (isArchive) {
          map.dragging.disable();
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
          if (map.tap) map.tap.disable();
        } else {
          map.dragging.enable();
          map.doubleClickZoom.enable();
          map.scrollWheelZoom.enable();
          map.boxZoom.enable();
          map.keyboard.enable();
          if (map.tap) map.tap.enable();
        }
      };

      const clearFallbackInteractions = () => {
        if (handleMapClick) {
          map.off("click", handleMapClick);
          handleMapClick = null;
        }
        if (fallbackMarker && handleFallbackDrag) {
          fallbackMarker.off("dragend", handleFallbackDrag);
          handleFallbackDrag = null;
        }
      };

      const renderMap = (payload) => {
        const center = payload?.center || { lat: 8.9486, lng: 125.5406 };
        const zoom = Number.isFinite(payload?.zoom) ? payload.zoom : 13;
        const isArchive = !!payload?.isArchive;
        const markersData = Array.isArray(payload?.markers) ? payload.markers : [];
        const routeData = Array.isArray(payload?.route) ? payload.route : [];

        setArchiveMode(isArchive);
        clearFallbackInteractions();

        markerLayerGroup.clearLayers();
        if (routeLayer) {
          map.removeLayer(routeLayer);
          routeLayer = null;
        }
        if (fallbackMarker) {
          map.removeLayer(fallbackMarker);
          fallbackMarker = null;
        }

        const boundsLayers = [];

        if (routeData.length > 1) {
          routeLayer = L.polyline(
            routeData.map(function(point) { return [point.lat, point.lng]; }),
            {
              color: "#2563EB",
              weight: 5,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }
          ).addTo(map);
          boundsLayers.push(routeLayer);
        }

        if (markersData.length > 0) {
          markersData.forEach(function(item, index) {
            const markerColor = item.color || (index === 0 ? "#2563EB" : "#16A34A");
            const markerTitle = item.title || "Location";
            const markerDescription = item.description ? "<br>" + item.description : "";
            const useIconMarker = item.iconType === "evac_center" || item.iconType === "current_location";

            const layer = useIconMarker
              ? L.marker([item.lat, item.lng], {
                  icon: createMarkerIcon(item, markerColor),
                })
              : L.circleMarker([item.lat, item.lng], {
                  radius: 8,
                  color: markerColor,
                  fillColor: markerColor,
                  fillOpacity: 0.9,
                  weight: 2,
                });

            layer.addTo(markerLayerGroup);
            layer.bindPopup(
              "<strong>" + markerTitle + "</strong><br>" +
              item.lat.toFixed(6) + ", " + item.lng.toFixed(6) +
              markerDescription
            );
            layer.on("click", function() {
              sendMessage({
                type: "marker_press",
                markerId: item.id ?? null,
                iconType: item.iconType ?? null,
                lat: item.lat,
                long: item.lng,
                title: markerTitle,
              });
            });

            boundsLayers.push(layer);
          });
        } else {
          fallbackMarker = L.marker([center.lat, center.lng], { draggable: !isArchive })
            .addTo(map)
            .bindPopup(
              (isArchive ? "Saved Location" : "Current Location") + ":<br>" +
              center.lat.toFixed(6) + ", " + center.lng.toFixed(6)
            )
            .openPopup();
          boundsLayers.push(fallbackMarker);

          if (!isArchive) {
            handleMapClick = function(e) {
              const lat = e.latlng.lat;
              const lng = e.latlng.lng;
              fallbackMarker.setLatLng(e.latlng);
              fallbackMarker.setPopupContent("Selected Location:<br>" + lat.toFixed(6) + ", " + lng.toFixed(6));
              fallbackMarker.openPopup();
              sendMessage({ type: "location_select", lat, long: lng });
            };
            map.on("click", handleMapClick);

            handleFallbackDrag = function(e) {
              const point = e.target.getLatLng();
              fallbackMarker.setPopupContent("Selected Location:<br>" + point.lat.toFixed(6) + ", " + point.lng.toFixed(6));
              fallbackMarker.openPopup();
              sendMessage({ type: "location_select", lat: point.lat, long: point.lng });
            };
            fallbackMarker.on("dragend", handleFallbackDrag);
          }
        }

        if (boundsLayers.length > 1) {
          const group = L.featureGroup(boundsLayers);
          map.fitBounds(group.getBounds().pad(0.2));
        } else if (boundsLayers.length === 1) {
          map.setView([center.lat, center.lng], zoom);
        } else {
          map.setView([center.lat, center.lng], zoom);
        }
      };

      window.__LEAFLET_MAP_UPDATE = renderMap;
      sendMessage({ type: "map_ready" });
    </script>
  </body>
</html>
`;

const LeafletMap = ({
  lat = 8.9486,
  long = 125.5406,
  zoom = 13,
  onLocationSelect,
  onMarkerPress,
  markers = [],
  routePolyline = [],
  type = "default",
}) => {
  const webviewRef = useRef(null);
  const isMapReadyRef = useRef(false);

  const safeMarkers = useMemo(
    () =>
      Array.isArray(markers)
        ? markers.filter(
            (item) =>
              typeof item?.lat === "number" &&
              typeof item?.lng === "number" &&
              !Number.isNaN(item.lat) &&
              !Number.isNaN(item.lng)
          )
        : [],
    [markers]
  );

  const safeRoutePolyline = useMemo(
    () =>
      Array.isArray(routePolyline)
        ? routePolyline.filter(
            (item) =>
              typeof item?.lat === "number" &&
              typeof item?.lng === "number" &&
              !Number.isNaN(item.lat) &&
              !Number.isNaN(item.lng)
          )
        : [],
    [routePolyline]
  );

  const mapPayload = useMemo(
    () => ({
      center: { lat, lng: long },
      zoom,
      isArchive: type === "archive",
      markers: safeMarkers,
      route: safeRoutePolyline,
    }),
    [lat, long, zoom, type, safeMarkers, safeRoutePolyline]
  );

  const pushMapUpdate = useCallback(() => {
    if (!isMapReadyRef.current || !webviewRef.current) return;
    const js = `
      if (window.__LEAFLET_MAP_UPDATE) {
        window.__LEAFLET_MAP_UPDATE(${JSON.stringify(mapPayload)});
      }
      true;
    `;
    webviewRef.current.injectJavaScript(js);
  }, [mapPayload]);

  useEffect(() => {
    pushMapUpdate();
  }, [pushMapUpdate]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: BASE_MAP_HTML }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={(event) => {
          let payload = null;
          try {
            payload = JSON.parse(event.nativeEvent.data);
          } catch (error) {
            return;
          }

          if (payload?.type === "map_ready") {
            isMapReadyRef.current = true;
            pushMapUpdate();
            return;
          }
          if (payload?.type === "marker_press") {
            if (onMarkerPress) onMarkerPress(payload);
            return;
          }
          if (type === "archive") return;
          if (payload?.type === "location_select" && onLocationSelect) {
            onLocationSelect({ lat: payload.lat, long: payload.long });
          }
        }}
      />
    </View>
  );
};

export default LeafletMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
});
