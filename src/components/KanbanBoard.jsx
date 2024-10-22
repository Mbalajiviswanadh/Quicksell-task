import React, { useState, useEffect } from "react";
import "./KanbanBoard.css";

import img1 from "../assets/profiles/img1.jpeg";
import img2 from "../assets/profiles/img2.jpg";
import img3 from "../assets/profiles/img3.jpg";
import img4 from "../assets/profiles/img4.jpg";
import img5 from "../assets/profiles/img5.webp";
import defaultAvatar from "../assets/profiles/default.jpg";

import Backlog from "../assets/icons_FEtask/Backlog.svg";
import Down from "../assets/icons_FEtask/down.svg";
import InProgress from "../assets/icons_FEtask/in-progress.svg";
import Done from "../assets/icons_FEtask/Done.svg";
import Cancelled from "../assets/icons_FEtask/Cancelled.svg";
import UrgentPriority_Colour from "../assets/icons_FEtask/SVG - Urgent Priority colour.svg"; // Fix: Use this instead of UrgentPriority
import HighPriority from "../assets/icons_FEtask/Img - High Priority.svg";
import LowPriority from "../assets/icons_FEtask/Img - Low Priority.svg";
import MediumPriority from "../assets/icons_FEtask/Img - Medium Priority.svg";
import NoPriority from "../assets/icons_FEtask/No-priority.svg";
import Display from "../assets/icons_FEtask/Display.svg";
import Todo from "../assets/icons_FEtask/To-do.svg";
import ThreeDots from "../assets/icons_FEtask/3 dot menu.svg";
import AddIcon from "../assets/icons_FEtask/add.svg";

// import UrgentPriority_grey from "../assets/icons_FEtask/SVG - Urgent Priority grey.svg";

const DisplayOptions = ({ grouping, sorting, setGrouping, setSorting }) => (
  <div className="options-dropdown">
    <div className="option-group">
      <label>Grouping</label>
      <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
        <option value="status"> Status</option>
        <option value="user">User</option>
        <option value="priority">Priority</option>
      </select>
    </div>
    <div className="option-group">
      <label>Ordering</label>
      <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
    </div>
  </div>
);

// Component for displaying priority icons
const PriorityIcon = ({ priority }) => {
  const priorityIconMap = {
    4: UrgentPriority_Colour,
    3: HighPriority,
    2: MediumPriority,
    1: LowPriority,
    0: NoPriority,
  };

  return (
    <img
      src={priorityIconMap[priority]}
      alt={`Priority ${priority}`}
      className="priority-icon"
    />
  );
};

// Component for displaying user avatars
const UserAvatar = ({ userId, users }) => {
  const user = users.find((u) => u.id === userId);

  const avatarMap = {
    "usr-1": img1,
    "usr-2": img2,
    "usr-3": img3,
    "usr-4": img4,
    "usr-5": img5,
  };

  return (
    <div className="user-avatar">
      <img src={avatarMap[userId] || defaultAvatar} alt={user?.name} />
    </div>
  );
};

// Ticket component for each task
const Ticket = ({ ticket, users }) => (
  <div className="ticket">
    <div className="ticket-header">
      <span className="ticket-id">{ticket.id}</span>
      <UserAvatar userId={ticket.userId} users={users} />
    </div>
    <div className="ticket-title">{ticket.title}</div>
    <div className="ticket-footer">
      <PriorityIcon priority={ticket.priority} />
      <div className="feature-tag">
        <div className="dot"></div>
        Feature Request
      </div>
    </div>
  </div>
);

// Column component for grouped tickets
const Column = ({ group, tickets, users, icon }) => (
  <div className="column">
    <div className="column-header">
      <div className="column-header-left">
        {icon && <img src={icon} alt={group} className="column-icon" />}
        <span className="column-title">{group}</span>
        <span className="ticket-count">{tickets.length}</span>
      </div>
      <div className="column-header-right">
        <button className="add-button">
          <img src={AddIcon} alt="Add" className="add-icon" />
        </button>
        <button className="options-button">
          <img src={ThreeDots} alt="Options" className="options-icon" />
        </button>
      </div>
    </div>
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <Ticket key={ticket.id} ticket={ticket} users={users} />
      ))}
    </div>
  </div>
);

// Main KanbanBoard component
const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(
    localStorage.getItem("grouping") || "status"
  );
  const [sorting, setSorting] = useState(
    localStorage.getItem("sorting") || "priority"
  );
  const [displayOptions, setDisplayOptions] = useState(false);

  useEffect(() => {
    fetchData();
    localStorage.setItem("grouping", grouping);
    localStorage.setItem("sorting", sorting);
  }, [grouping, sorting]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://api.quicksell.co/v1/internal/frontend-assignment"
      );
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Get priority label text based on priority number
  const getPriorityText = (priority) => {
    const priorityMap = {
      4: "Urgent",
      3: "High",
      2: "Medium",
      1: "Low",
      0: "No priority",
    };
    return priorityMap[priority];
  };

  const getColumnIcon = (group, grouping) => {
    if (grouping === "status") {
      const statusIcons = {
        todo: Todo,
        "in progress": InProgress,
        done: Done,
        cancelled: Cancelled,
        backlog: Backlog,
      };
      return statusIcons[group.toLowerCase()];
    } else if (grouping === "priority") {
      const priorityIcons = {
        Urgent: UrgentPriority_Colour,
        High: HighPriority,
        Medium: MediumPriority,
        Low: LowPriority,

        "No priority": NoPriority,
      };
      return priorityIcons[group];
    }
    return null;
  };

  const groupTickets = (tickets) => {
    if (!tickets.length) return {};

    let grouped = {};

    if (grouping === "status") {
      tickets.forEach((ticket) => {
        if (!grouped[ticket.status]) {
          grouped[ticket.status] = [];
        }
        grouped[ticket.status].push(ticket);
      });
    } else if (grouping === "user") {
      tickets.forEach((ticket) => {
        const user = users.find((u) => u.id === ticket.userId) || {
          name: ticket.userId,
        };
        if (!grouped[user.name]) {
          grouped[user.name] = [];
        }
        grouped[user.name].push(ticket);
      });
    } else if (grouping === "priority") {
      tickets.forEach((ticket) => {
        const priorityText = getPriorityText(ticket.priority);
        if (!grouped[priorityText]) {
          grouped[priorityText] = [];
        }
        grouped[priorityText].push(ticket);
      });
    }

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (sorting === "priority") {
          return b.priority - a.priority;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
    });

    return grouped;
  };

  const groupedTickets = groupTickets(tickets);

  return (
    <div className="kanban-container">
      <div className="header">
        <button
          className="display-button"
          onClick={() => setDisplayOptions(!displayOptions)}>
          <img src={Display} alt="Display" />
          <span className="display-text">Display</span>
          <img src={Down} alt="Down arrow" className="down-icon" />
        </button>

        {displayOptions && (
          <DisplayOptions
            grouping={grouping}
            sorting={sorting}
            setGrouping={setGrouping}
            setSorting={setSorting}
          />
        )}
      </div>

      <div className="board">
        {Object.entries(groupedTickets).map(([group, tickets]) => (
          <Column
            key={group}
            group={group}
            tickets={tickets}
            users={users}
            icon={getColumnIcon(group, grouping)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
