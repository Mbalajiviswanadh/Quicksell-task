import React, { useState, useEffect } from "react";
import "./KanbanBoard.css";

const DisplayOptions = ({ grouping, sorting, setGrouping, setSorting }) => (
  <div className="options-dropdown">
    <div className="option-group">
      <label>Grouping</label>
      <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
        <option value="status">Status</option>
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

const Ticket = ({ ticket, getPriorityIcon }) => (
  <div className="ticket">
    <div className="ticket-header">
      <span className="ticket-id">{ticket.id}</span>
    </div>
    <div className="ticket-title">{ticket.title}</div>
    <div className="ticket-footer">
      <span className="priority-icon">{getPriorityIcon(ticket.priority)}</span>
      <div className="tag">{ticket.tag[0]}</div>
    </div>
  </div>
);

const Column = ({ group, tickets, getPriorityIcon }) => (
  <div className="column">
    <div className="column-header">
      <h3>{group}</h3>
      <span className="ticket-count">{tickets.length}</span>
    </div>
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <Ticket
          key={ticket.id}
          ticket={ticket}
          getPriorityIcon={getPriorityIcon}
        />
      ))}
    </div>
  </div>
);

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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 4:
        return "🔴"; // Urgent
      case 3:
        return "🟡"; // High
      case 2:
        return "🟢"; // Medium
      case 1:
        return "⚪"; // Low
      default:
        return "⚫"; // No priority
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 4:
        return "Urgent";
      case 3:
        return "High";
      case 2:
        return "Medium";
      case 1:
        return "Low";
      default:
        return "No priority";
    }
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

    // Sort tickets within each group
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
          Display ▼
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
            getPriorityIcon={getPriorityIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
