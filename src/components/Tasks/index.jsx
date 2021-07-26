import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Draggable } from "react-beautiful-dnd";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import CloseIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Tasks = ({ columns, column }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      {columns &&
        column.taskIds &&
        column.taskIds.map((item, index) => {
          return (
            <Draggable key={item._id} draggableId={item._id} index={index}>
              {(provided, snapshot) => {
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: "none",
                      padding: 16,
                      margin: "0 0 8px 0",
                      minHeight: "50px",
                      backgroundColor: snapshot.isDragging
                        ? "#263B4A"
                        : "#3f51b5",
                      color: "white",
                      ...provided.draggableProps.style,
                    }}
                    onClick={handleOpen}
                  >
                    {item.content}
                    <Modal
                      aria-labelledby="transition-modal-title"
                      aria-describedby="transition-modal-description"
                      className={classes.modal}
                      open={open}
                      onClose={handleClose}
                      closeAfterTransition
                      BackdropComponent={Backdrop}
                      BackdropProps={{
                        timeout: 500,
                      }}
                    >
                      <Fade in={open}>
                        <div className={classes.paper}>
                          <h2 id="transition-modal-title">{item.content}</h2>
                          {item.description ? (
                            <p id="transition-modal-description">
                              {item.description}
                            </p>
                          ) : (
                            <p id="transition-modal-description">
                              No description available
                            </p>
                          )}
                          <Button
                            onClick={handleClose}
                            style={{
                              marginTop: 5,
                            }}
                            variant="contained"
                            color="secondary"
                            className={classes.button}
                            startIcon={<CloseIcon />}
                          >
                            Close
                          </Button>
                        </div>
                      </Fade>
                    </Modal>
                  </div>
                );
              }}
            </Draggable>
          );
        })}
    </div>
  );
};

export default Tasks;
