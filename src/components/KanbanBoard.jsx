import React, { useState, useEffect } from "react";

// Top-level component
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
    // Save preferences to localStorage
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
        if (!grouped[ticket.userId]) {
          grouped[ticket.userId] = [];
        }
        grouped[ticket.userId].push(ticket);
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
          <div className="options-dropdown">
            <div className="option-group">
              <label>Grouping</label>
              <select
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}>
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="option-group">
              <label>Ordering</label>
              <select
                value={sorting}
                onChange={(e) => setSorting(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="board">
        {Object.entries(groupedTickets).map(([group, tickets]) => (
          <div key={group} className="column">
            <div className="column-header">
              <h3>{group}</h3>
              <span className="ticket-count">{tickets.length}</span>
            </div>
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket">
                  <div className="ticket-header">
                    <span className="ticket-id">{ticket.id}</span>
                  </div>
                  <div className="ticket-title">{ticket.title}</div>
                  <div className="ticket-footer">
                    <span className="priority-icon">
                      {getPriorityIcon(ticket.priority)}
                    </span>
                    <div className="tag">{ticket.tag[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .kanban-container {
          padding: 20px;
          background-color: #f4f5f8;
          min-height: 100vh;
        }

        .header {
          position: relative;
          margin-bottom: 20px;
        }

        .display-button {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
        }

        .options-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .option-group {
          margin-bottom: 12px;
        }

        .option-group label {
          display: block;
          margin-bottom: 4px;
          color: #666;
        }

        .option-group select {
          width: 200px;
          padding: 4px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .board {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding-bottom: 20px;
        }

        .column {
          min-width: 300px;
          background: #f4f5f8;
        }

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
        }

        .ticket-count {
          background: #e0e0e0;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .ticket-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ticket {
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .ticket-id {
          color: #666;
          font-size: 14px;
        }

        .ticket-title {
          margin-bottom: 12px;
          font-size: 14px;
        }

        .ticket-footer {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .priority-icon {
          font-size: 16px;
        }

        .tag {
          background: #f4f5f8;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          border: 1px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;
