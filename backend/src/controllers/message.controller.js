import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { encryptMessage, decryptMessage, validateEncryptionConfig } from "../lib/encryption.js";
import { createNotification } from "./notification.controller.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Decrypt messages before sending to client
    const decryptedMessages = messages.map(message => {
      if (message.isEncrypted && message.text) {
        try {
          const decryptedText = decryptMessage(
            message.text,
            message.senderId.toString(),
            message.receiverId.toString()
          );
          return {
            ...message.toObject(),
            text: decryptedText
          };
        } catch (error) {
          console.error('Failed to decrypt message:', error);
          return {
            ...message.toObject(),
            text: '[Message decryption failed]'
          };
        }
      }
      return message.toObject();
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Encrypt the message text before saving to database
    let encryptedText = null;
    let isEncrypted = false;

    if (text) {
      try {
        validateEncryptionConfig();
        encryptedText = encryptMessage(text, senderId.toString(), receiverId.toString());
        isEncrypted = true;
        console.log('✅ Message encrypted successfully');
      } catch (error) {
        console.error('⚠️  Encryption failed, saving as plaintext:', error);
        encryptedText = text;
        isEncrypted = false;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: encryptedText,
      image: imageUrl,
      isEncrypted,
    });

    await newMessage.save();

    // Send notification to receiver
    try {
      const sender = await User.findById(senderId).select('fullName username');
      const messagePreview = text ? (text.length > 50 ? text.substring(0, 50) + "..." : text) : "Sent an image";

      await createNotification({
        recipientId: receiverId,
        senderId: senderId,
        type: 'message',
        message: `${sender.fullName} sent you a message: ${messagePreview}`,
        metadata: {
          senderUsername: sender.username,
          messagePreview: messagePreview
        }
      });
    } catch (notificationError) {
      console.log("Error creating message notification:", notificationError.message);
      // Don't fail the message send if notification fails
    }

    // Prepare the message for real-time transmission (with decrypted text)
    const messageForTransmission = {
      ...newMessage.toObject(),
      text: text || null // Send original plaintext for real-time display
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageForTransmission);
    }

    res.status(201).json(messageForTransmission);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
