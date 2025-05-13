import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      console.log("Sending message to:", selectedUser._id, messageData);
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      console.log("Message sent, response:", res.data);

      set({ messages: [...messages, res.data] });
      return res.data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket not connected, can't subscribe to messages");
      return;
    }

    console.log("Subscribing to messages for user:", selectedUser._id);

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      console.log("Received new message via socket:", newMessage);

      const isMessageForCurrentConversation =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (isMessageForCurrentConversation) {
        console.log("Adding message to conversation");
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else {
        console.log("Message not for current conversation, ignoring");
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Unsubscribing from messages");
      socket.off("newMessage");
    }
  },

  setSelectedUser: (user) => {
    get().unsubscribeFromMessages();

    set({ selectedUser: user });

    if (user) {
      get().getMessages(user._id);
      setTimeout(() => {
        get().subscribeToMessages();
      }, 100);
    }
  },
}));
