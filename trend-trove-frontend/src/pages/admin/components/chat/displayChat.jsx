import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Send, Done, DoneAll } from "@mui/icons-material";
import io from "socket.io-client";
import adminAxiosInstance from "@/utils/adminAxiosInstance";

const DisplayChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;
      setIsAutoScrolling(isNearBottom);
    }
  };

  useEffect(() => {
    if (selectedChat?.messages && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    } else if (isAutoScrolling && selectedChat?.messages) {
      scrollToBottom();
    }
  }, [selectedChat?.messages, isInitialLoad]);

  useEffect(() => {
    if (selectedChatId) {
      setIsInitialLoad(true);
    }
  }, [selectedChatId]);

  useEffect(() => {
    loadChats();

    // const newSocket = io("https://www.trendrove.shop", {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Admin socket connected:", newSocket.id);
      newSocket.emit("admin-join");
    });

    newSocket.on("new-message", (data) => {
      console.log("New message received:", data);
      if (data.message && data.chatId) {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id !== data.chatId) return chat;

            const messageExists = chat.messages.some(
              (msg) => msg._id === data.message._id
            );
            if (messageExists) return chat;

            return {
              ...chat,
              messages: [...chat.messages, data.message].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
              ),
            };
          });
        });
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const currentChat = chats.find((chat) => chat._id === selectedChatId);
      if (currentChat) {
        setSelectedChat(currentChat);
        markChatAsRead(selectedChatId);
      }
    }
  }, [chats, selectedChatId]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await adminAxiosInstance.get("/chat/admin-chats");
      if (response.data) {
        setChats(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
      setError("Failed to load chats");
      setLoading(false);
    }
  };

  const getLatestMessage = (chat) => {
    if (chat.messages.length === 0) return "";
    const latestMessage = chat.messages[chat.messages.length - 1];
    return latestMessage.message;
  };

  const hasUnreadMessages = (chat) => {
    return chat.messages.some((msg) => msg.senderType === "User" && !msg.read);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    const messageText = message.trim();
    setMessage("");

    try {
      const response = await adminAxiosInstance.post("/chat/send-message", {
        userId: selectedChat.user._id,
        message: messageText,
        senderType: "Admin",
      });

      if (response.data.success) {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id !== selectedChat._id) return chat;

            return {
              ...chat,
              messages: [...chat.messages, response.data.data].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
              ),
            };
          });
        });

        socket?.emit("send-message", {
          userId: selectedChat.user._id,
          message: messageText,
          senderType: "Admin",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
      setMessage(messageText);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat._id);
    setIsAutoScrolling(true);
  };

  const markChatAsRead = async (chatId) => {
    try {
      await adminAxiosInstance.put(`/chat/mark-read/${chatId}`);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.senderType === "User" ? { ...msg, read: true } : msg
                ),
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const getUnreadCount = (chat) => {
    return chat.messages.filter((msg) => !msg.read && msg.senderType === "User")
      .length;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", height: "95vh", p: 2, gap: 2, bgcolor: "transparent" }}
    >
      {/* Chat List Sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: 320,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            Chats
          </Typography>
        </Box>

        <List
          sx={{
            overflow: "auto",
            flex: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#1E1F23",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#424242",
              borderRadius: "3px",
            },
          }}
        >
          {chats
            .filter(
              (chat, index, self) =>
                chat.user &&
                chat.user._id &&
                index === self.findIndex((c) => c.user?._id === chat.user._id)
            )
            .map((chat) => {
              console.log(chat);
              return (
                <React.Fragment key={chat._id}>
                  <ListItem
                    button
                    selected={selectedChatId === chat._id}
                    onClick={() => handleChatSelect(chat)}
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(255, 152, 0, 0.08)",
                        "&:hover": {
                          bgcolor: "rgba(255, 152, 0, 0.12)",
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={getUnreadCount(chat)}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            bgcolor: "#e74c3c",
                            
                          },
                        }}
                      >
                        <Avatar
                          src={chat.user?.image}
                          sx={{
                            bgcolor: "#FF9800",
                            width: 45,
                            height: 45,
                          }}
                        >
                          {chat.user?.username?.[0]?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: hasUnreadMessages(chat) ? 600 : 400,
                            color: "#ffffff",
                          }}
                        >
                          {chat.user?.username || "Anonymous"}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: hasUnreadMessages(chat)
                              ? "#2c3e50"
                              : "#7f8c8d",
                            fontWeight: hasUnreadMessages(chat) ? 500 : 400,
                            fontSize: "0.85rem",
                          }}
                        >
                          {getLatestMessage(chat)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              );
            })}
        </List>
      </Paper>

      {selectedChat ? (
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "transparent",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              src={selectedChat.user?.image}
              sx={{ width: 48, height: 48, bgcolor: "#FF9800" }}
            >
              {selectedChat.user?.username?.[0]?.toUpperCase()}
            </Avatar>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                }}
              >
                {selectedChat.user?.username || "Anonymous"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#B8BBC2" }}>
                {selectedChat.user?.email}
              </Typography>
            </Box>
          </Box>

          <Box
            ref={chatContainerRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              p: 2,
              overflow: "auto",
              bgcolor: "transparent",
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#1E1F23",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#424242",
                borderRadius: "3px",
              },
            }}
          >
            {selectedChat.messages.map((msg) => (
              <Box
                key={msg._id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.senderType === "Admin" ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2,
                    bgcolor: msg.senderType === "Admin" ? "#FF9800" : "#2C2D33",
                    color: "#ffffff",
                    maxWidth: "70%",
                    borderRadius: 2,
                    position: "relative",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {msg.message}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#B8BBC2",
                        fontSize: "0.75rem",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    {/* {msg.senderType === "Admin" && (
                      msg.read ? (
                        <DoneAll sx={{ fontSize: 16, color: '#3498db' }} />
                      ) : (
                        <Done sx={{ fontSize: 16, color: '#7f8c8d' }} />
                      )
                    )} */}
                  </Box>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "transparent",
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!message.trim()}
              sx={{
                bgcolor: "#FF9800",
                
                "&:hover": {
                  bgcolor: "#F57C00",
                },
                "&:disabled": {
                  bgcolor: "#333333",
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#B8BBC2" }}>
            Select a chat to start messaging
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </Box>
  );
};

export default DisplayChat;
