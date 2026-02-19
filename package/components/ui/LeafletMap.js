import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const LeafletMap = ({
  lat = 8.9486,
  long = 125.5406,
  zoom = 13,
  onLocationSelect,
  markers = [],
  type = "default",
}) => {
  const webviewRef = useRef(null);

  const safeMarkers = Array.isArray(markers)
    ? markers.filter(
        (item) =>
          typeof item?.lat === "number" &&
          typeof item?.lng === "number" &&
          !Number.isNaN(item.lat) &&
          !Number.isNaN(item.lng)
      )
    : [];

  const mapCenter = safeMarkers[0] || { lat, lng: long };

  const mapHTML = `
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
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const initialLat = ${mapCenter.lat};
        const initialLng = ${mapCenter.lng};
        const isArchive = ${type === "archive" ? "true" : "false"};
        const markersData = ${JSON.stringify(safeMarkers)};

        const map = L.map("map", {
          zoomControl: true,
          dragging: !isArchive,
          doubleClickZoom: !isArchive,
          scrollWheelZoom: !isArchive,
          boxZoom: !isArchive,
          keyboard: !isArchive,
          tap: !isArchive,
        }).setView([initialLat, initialLng], ${zoom});

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "OpenStreetMap contributors",
        }).addTo(map);

        if (markersData.length > 0) {
          const layers = [];

          markersData.forEach(function(item, index) {
            const markerColor = item.color || (index === 0 ? "#2563EB" : "#16A34A");
            const markerTitle = item.title || "Location";
            const markerDescription = item.description ? "<br>" + item.description : "";

            const layer = L.circleMarker([item.lat, item.lng], {
              radius: 8,
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.9,
              weight: 2,
            }).addTo(map);

            layer.bindPopup(
              "<strong>" + markerTitle + "</strong><br>" +
              item.lat.toFixed(6) + ", " + item.lng.toFixed(6) +
              markerDescription
            );

            layers.push(layer);
          });

          if (layers.length === 1) {
            layers[0].openPopup();
          } else if (layers.length > 1) {
            const group = L.featureGroup(layers);
            map.fitBounds(group.getBounds().pad(0.25));
          }
        } else {
          let marker = L.marker([initialLat, initialLng], { draggable: !isArchive })
            .addTo(map)
            .bindPopup(
              (isArchive ? "Saved Location" : "Current Location") + ":<br>" +
              initialLat.toFixed(6) + ", " + initialLng.toFixed(6)
            )
            .openPopup();

          if (!isArchive) {
            map.on("click", function(e) {
              const { lat, lng } = e.latlng;
              marker.setLatLng(e.latlng);
              marker.setPopupContent("Selected Location:<br>" + lat.toFixed(6) + ", " + lng.toFixed(6));
              marker.openPopup();
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat, long: lng }));
            });

            marker.on("dragend", function(e) {
              const { lat, lng } = e.target.getLatLng();
              marker.setPopupContent("Selected Location:<br>" + lat.toFixed(6) + ", " + lng.toFixed(6));
              marker.openPopup();
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat, long: lng }));
            });
          }
        }
      </script>
    </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: mapHTML }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={(event) => {
          if (type === "archive") return;
          const coords = JSON.parse(event.nativeEvent.data);
          if (onLocationSelect) onLocationSelect(coords);
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
