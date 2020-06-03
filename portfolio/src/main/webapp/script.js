// Copyright 2019 Google LLC
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

/*
  Controls slideshow on page
*/

function getMessage() {
  fetch('/data').then(response => response.json()).then(msg => {
    let comments = "Comments: \n";
    let properties;
    for (let comment of msg){
      properties = comment.propertyMap;
      comments += properties.name + ": " + properties.comment + "\n";
    }
    document.getElementById('msg-container').innerText = comments;
  });
}

class slideShower {
  constructor() {
    this.currentIndex = 1;
    this.slides = document.getElementsByClassName("slides");
    this.dots = document.getElementsByClassName("dot");
    this.showSlides(this.currentIndex);
  }

  showSlides(slideNum) {
    let i;
    if (slideNum > this.slides.length) {
      this.currentIndex = 1;
    }
    if (slideNum < 1) {
      this.currentIndex = this.slides.length;
    }

    for (let slide of this.slides) {
      slide.style.display = "none";
    }
    for (let dot of this.dots) {
      dot.className = dot.className.replace(" active", "");
    }

    this.slides[this.currentIndex - 1].style.display = "block";
    this.dots[this.currentIndex - 1].className += " active";
  }

  changeSlides(amount) {
    this.showSlides((this.currentIndex += amount));
  }

  // Thumbnail image controls
  currentSlide(index) {
    this.showSlides((this.currentIndex = index));
  }
}

const slides = new slideShower();
