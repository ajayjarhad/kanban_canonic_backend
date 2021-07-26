import React, { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

// Mutation query to add a Task, here content is mandotory but description isn't
const ADD_TASK = gql`
  mutation createTaskMutation($content: String!, $description: String!) {
    createTask(input: { content: $content, description: $description }) {
      content
      _id
      description
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
      }
    }
  }
`;
const NewTask = ({ taskIds, columnId, columnNumber, columnTitle }) => {
  const classes = useStyles();
  const [updateColumn] = useMutation(UPDATE_COLUMN);
  const [createTask, { data }] = useMutation(ADD_TASK);
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");

  // Sets up the content
  const handleOnChange = (event) => {
    setContent(event.target.value);
  };

  // Sets up the description
  const handleOnChangeDescription = (event) => {
    setDescription(event.target.value);
  };
  // Function to fire the mutation with data gather from input fields
  const handleOnSubmit = (event) => {
    event.preventDefault();
    if (content) {
      createTask({
        variables: {
          content: content,
          description: description,
        },
      });
    }
    setContent("");
    setDescription("");
  };
  // Updating the column's taskIds array with recently created task's id
  useEffect(() => {
    if (data) {
      if (data.createTask) {
        updateColumn({
          variables: {
            _id: columnId,
            title: columnTitle,
            taskIds: [...taskIds[columnNumber], data.createTask._id],
          },
        });
      }
    }
  }, [data]);
  return (
    <div>
      <div className={classes.margin}>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item>
            <AddIcon />
          </Grid>
          <Grid item>
            <TextField
              value={content}
              id={`input-with-icon-grid${columnNumber}`}
              label="Add a new task"
              onChange={handleOnChange}
            />
            <br />
            <TextField
              value={description}
              id={`input-with-icon-grid${columnNumber + 1}`}
              label="description (optional)"
              onChange={handleOnChangeDescription}
            />
          </Grid>
        </Grid>
        <Button
          onClick={handleOnSubmit}
          style={{
            marginTop: 5,
          }}
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default NewTask;
