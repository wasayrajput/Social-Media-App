// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  authorId?: string;
  author: {
    id: string;
    name: string;
    email: string;
    bio?: string;
  };
  savedBy?: { userId: string }[];
  likes?: { userId: string }[];
}