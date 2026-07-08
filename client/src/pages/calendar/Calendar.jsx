import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import { meetingsAPI } from "@/api/meetings.api";
import { useAuthStore } from "@/store/auth.store";

export default function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      console.log("Token:", useAuthStore.getState().token);
      console.log("Company:", useAuthStore.getState().activeCompany);
      const response = await meetingsAPI.getMeetings();

      const meetings = response.data.data;

      const calendarEvents = meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        start: meeting.startTime,
        end: meeting.endTime,

        backgroundColor:
          meeting.priority === "high"
            ? "#ef4444"
            : meeting.priority === "medium"
              ? "#f59e0b"
              : "#22c55e",

        borderColor:
          meeting.priority === "high"
            ? "#ef4444"
            : meeting.priority === "medium"
              ? "#f59e0b"
              : "#22c55e",

        extendedProps: {
          description: meeting.description,
          location: meeting.location,
          meetingType: meeting.meetingType,
          priority: meeting.priority,
          status: meeting.status,
        },
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to load meetings", error);
    }
  };

  const handleDateClick = (info) => {
    alert(`Selected Date: ${info.dateStr}`);
  };

  const handleEventClick = (info) => {
    const meeting = info.event;

    alert(`
Meeting: ${meeting.title}

Description:
${meeting.extendedProps.description || "N/A"}

Location:
${meeting.extendedProps.location || "N/A"}

Status:
${meeting.extendedProps.status}

Priority:
${meeting.extendedProps.priority}
`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar & Meetings</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          selectable={true}
          editable={true}
          weekends={true}
          height="80vh"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>
    </div>
  );
}
