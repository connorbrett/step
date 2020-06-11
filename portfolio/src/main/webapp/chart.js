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

/**
 *Creates a chart and adds it to the page.
 */

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Activity');
  data.addColumn('number', 'Hours');
  data.addRows([
    ['Sleep', 7],
    ['Eat', 3],
    ['Work', 8],
    ['Exercise', 1],
    ['Video Games', 3],
    ['YouTube', 2],
  ]);

  const options = {
    'title': 'How I Spend My Time',
    'width': 500,
    'height': 400,
  };

  const chart = new google.visualization.PieChart(
    document.getElementById('chart-container'));
  chart.draw(data, options);
}