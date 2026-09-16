import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Post {
  id: string;
  content: string;
  image?: string | null;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  likes?: number;
  comments?: any[];
}

interface PostsState {
  posts: Post[];
}

const initialState: PostsState = {
  posts: [],
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    updatePostInStore: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index].content = action.payload.content;
      }
    },
    deletePostFromStore: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addPost, setPosts, updatePostInStore, deletePostFromStore } = postsSlice.actions;
export default postsSlice.reducer;