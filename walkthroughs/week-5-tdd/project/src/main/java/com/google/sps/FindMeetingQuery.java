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

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.HashSet;
import com.google.common.collect.Sets; 
import com.google.common.collect.Sets.SetView;
import java.util.Set; 


public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

    HashSet<String> attendees = new HashSet<>(request.getAttendees());
    HashSet<String> optAttendees = new HashSet<>(request.getOptionalAttendees());
    HashSet<String> eventAttendees;

    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return Arrays.asList();
    }

    // mandatory + optional attendees times
    ArrayList<TimeRange> mandOptBusy = new ArrayList<>();

    // mandatory attendees times
    ArrayList<TimeRange> mandBusy = new ArrayList<>();

    for (Event e : events) {
      Set<String> meetingAttendees = e.getAttendees();
      if (!Sets.intersection(attendees, meetingAttendees).isEmpty()) {
        // If event contains at least one mandatory attendee, add it to list of busy times
        mandOptBusy.add(e.getWhen());
        mandBusy.add(e.getWhen());
      } else {
        // If event contains optional, but no mandatory attendees, add to opt list
        SetView<String> optInMeeting = Sets.intersection(optAttendees, meetingAttendees);
        if (optInMeeting.size() != 0) {
          mandOptBusy.add(e.getWhen());
        }
      }
    }

    Collections.sort(mandOptBusy, TimeRange.ORDER_BY_START);
    
    // keep track of openings for MAN and MAN+OPT
    ArrayList<TimeRange> mandOptOpenings = findOpenings(mandOptBusy, request.getDuration(), attendees);

    if (mandOptOpenings.isEmpty() && !request.getAttendees().isEmpty()) {
      // if no openings for mand + opt, return mand only
      Collections.sort(mandBusy, TimeRange.ORDER_BY_START);
      return findOpenings(mandBusy, request.getDuration(), attendees);
    }
    // if openings exist for both or only contains opt attendees, return those
    return mandOptOpenings;
  }

  /*
  * Finds all potential open TimeRanges for a meeting
  * Parameters:
  * busy: contains all busy TimeRanges (sorted by startTime) to be scheduled around
  * duration: duration of meeting to be scheduled
  * attendees: set of attendees to attend new meeting
  *
  * Returns: a list of possible TimeRanges where all attendees are available 
  */
  private static ArrayList<TimeRange> findOpenings(ArrayList<TimeRange> busy, long duration, Set<String> attendees) {
    int startTime = 0; 
    int endTime = 0;
    TimeRange newRange;
    TimeRange prevRange;
    ArrayList<TimeRange> openings = new ArrayList<>();
    for (TimeRange currRange : busy) {
      
      if (endTime < currRange.start()) {
        endTime = currRange.start();
      }
      newRange = TimeRange.fromStartEnd(startTime, endTime, false);

      if (openings.isEmpty()) {
        addOpening(openings, newRange, duration);
      } else {
        prevRange = openings.get(openings.size() - 1);
        if (!newRange.contains(prevRange)) {
          addOpening(openings, newRange, duration);
        }
      }

      if (startTime < currRange.end()) {
        startTime = currRange.end();
      }
    }
    endTime = TimeRange.END_OF_DAY;
    newRange = TimeRange.fromStartEnd(startTime, endTime, true);
    addOpening(openings, newRange, duration);
    return openings;
  }

  /*
   * Adds opening to list if the opening is long enough
   */
  private static void addOpening(ArrayList<TimeRange> openings, 
    TimeRange currRange, long duration) {
      if (currRange.duration() >= duration) {
        openings.add(currRange);
      } 
    }
}
