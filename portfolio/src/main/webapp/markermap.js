// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 *Handles creating and storing markers on the map
 */

class MarkerMap {
  constructor(){
    this.map;
    this.editMarker;
    this.markers = [];
  }

  createMap() {
    this.map = new google.maps.Map(
      document.getElementById('map'),
      {
        center: { lat: 38.5949, lng: -94.8923 },
        zoom: 4,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
          }
        ]
      });

    // When the user clicks in the map, show a marker with a text box the user can
    // edit.
    this.map.addListener('click', (event) => {
      this.createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
    });

    this.fetchMarkers();
  }

  /** Fetches markers from the backend and adds them to the map. */
  fetchMarkers() {
    fetch('/markers')
      .then(response => response.json())
      .then((markers) => {
        for (let marker of this.markers) {
          let index = this.markers.indexOf(marker);
          this.markers.splice(index, 1);
          marker.setMap(null);

        }
        markers.forEach(
          (marker) => {
            this.markers.push(this.createMarkerForDisplay(marker.lat, marker.lng, marker.content, marker.id));
          }
        );
    });
  }

  /** Deletes markers from the backend */
  deleteMarkers() {
    fetch('/delete-markers', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
      },
      body: ''
    }).then(() => {
      this.fetchMarkers();
    });
  }

  /** Creates a marker that shows a read-only info window when clicked. */
  createMarkerForDisplay(lat, lng, content, id) {
    const marker =
      new google.maps.Marker({ position: { lat: lat, lng: lng }, map: this.map });

    const infoWindow = new google.maps.InfoWindow({ content: content });
    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });

    marker.addListener('dblclick', () => {
      fetch('/delete-marker?id=' + id, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
        },
        body: ''
      }).then(response => this.fetchMarkers());
    });
    return marker;
  }

  /** Sends a marker to the backend for saving. */
  postMarker(lat, lng, content) {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('content', content);

    fetch('/markers', { method: 'POST', body: params })
      .then(() => this.fetchMarkers());
  }

  /** Creates a marker that shows a textbox the user can edit. */
  createMarkerForEdit(lat, lng) {
    // If we're already showing an editable marker, then remove it.
    if (this.editMarker) {
      this.editMarker.setMap(null);
    }

    this.editMarker =
      new google.maps.Marker({ position: { lat: lat, lng: lng }, map: this.map });

    const infoWindow =
      new google.maps.InfoWindow({ content: this.buildInfoWindowInput(lat, lng) });

    // When the user closes the editable info window, remove the marker.
    google.maps.event.addListener(infoWindow, 'closeclick', () => {
      this.editMarker.setMap(null);
    });

    infoWindow.open(this.map, this.editMarker);
  }

  /**
   * Builds and returns HTML elements that show an editable textbox and a submit
   * button.
   */
  buildInfoWindowInput(lat, lng) {
    const textBox = document.createElement('textarea');
    const button = document.createElement('button');
    button.appendChild(document.createTextNode('Submit'));

    button.onclick = () => {
      this.postMarker(lat, lng, textBox.value);
      this.editMarker.setMap(null);
    };

    const containerDiv = document.createElement('div');
    containerDiv.appendChild(textBox);
    containerDiv.appendChild(document.createElement('br'));
    containerDiv.appendChild(button);

    return containerDiv;
  }
}

const markerMap = new MarkerMap();