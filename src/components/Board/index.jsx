import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useQuery, gql, useMutation } from "@apollo/client";
import Tasks from "../Tasks";
import NewTasks from "../NewTask";
import CircularProgress from "@material-ui/core/CircularProgress";

// This query fetches columns from the backend built in Canonic.
const GET_COLUMN = gql`
  query {
    columns {
      _id
      title
      taskIds {
        content
        _id
        description
      }
    }
  }
`;
// This query is used to update a column, it mainly is used when a new task is created so it gets attached to the respective column.
const UPDATE_COLUMN = gql`
  mutation updateColumnMutation($_id: ID!, $title: String!, $taskIds: [ID!]!) {
    updateColumn(_id: $_id, input: { title: $title, taskIds: $taskIds }) {
      _id
      title
      taskIds {
        _id
        content
        description
      }
    }
  }
`;

const Board = () => {
  const [columns, setColumns] = useState(null);
  const [taskIds, setTaskIds] = useState(null);
  const [updateColumn] = useMutation(UPDATE_COLUMN);
  const column = useQuery(GET_COLUMN);
  // After data has been loaded code, useEffect is called to assign column state
  useEffect(() => {
    if (column.data) {
      if (column.data.columns) {
        setColumns(column.data.columns);
      }
    }
  }, [column.data]);
  // useeffect is called to filter the list of task ids from column.
  useEffect(() => {
    if (columns) {
      let someData = Object.entries(columns).map(([columnId, column], index) =>
        column.taskIds.map((item) => item._id)
      );
      setTaskIds(someData);
    }
  }, [columns]);

  // React-beautiful-DND's code that is responsible for drag and drop.
  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.taskIds];
      const destItems = [...destColumn.taskIds];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          taskIds: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          taskIds: destItems,
        },
      });

      let sour = sourceItems.map((item) => item._id);
      let dest = destItems.map((item) => item._id);
      // Calling mutation to update the backend after drag and drop has changed task's positions
      updateColumn({
        variables: {
          _id: columns[source.droppableId]._id,
          title: columns[source.droppableId].title,
          taskIds: sour,
        },
      });
      updateColumn({
        variables: {
          _id: columns[destination.droppableId]._id,
          title: columns[destination.droppableId].title,
          taskIds: dest,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.taskIds];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          taskIds: copiedItems,
        },
      });
      let moved = copiedItems.map((item) => item._id);
      //calling Mutation to update in-cloumn drag and drop position change
      updateColumn({
        variables: {
          _id: column._id,
          title: column.title,
          taskIds: moved,
        },
      });
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        marginLeft: "15%",
      }}
    >
      {column.loading ? (
        <CircularProgress />
      ) : (
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {columns &&
            Object.entries(columns).map(([columnId, column], index) => {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  key={columnId}
                >
                  <h2>{column.title}</h2>
                  <div style={{ margin: 8 }}>
                    <Droppable droppableId={columnId} key={columnId}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                              background: snapshot.isDraggingOver
                                ? "#eaecfa"
                                : "#eaecfa",
                              padding: 4,
                              width: 250,
                              minHeight: 350,
                              borderRadius: "4px",
                            }}
                          >
                            <Tasks columns={columns} column={column} />
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                  {columns && (
                    <NewTasks
                      taskIds={taskIds}
                      columnId={column._id}
                      columnNumber={columnId}
                      columnTitle={column.title}
                    />
                  )}
                </div>
              );
            })}
        </DragDropContext>
      )}
    </div>
  );
};
export default Board;
