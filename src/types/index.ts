export interface User {
    id: string
    email: string
    username: string
    first_name: string
    last_name: string
    bio?: string
    avatar_url?: string
    website?: string
    location?: string
    posts_count: number
    followers_count: number
    following_count: number
    last_login?: string
    created_at: string
    updated_at: string
  }
  
  export interface Post {
    id: string
    content: string
    author_id: string
    image_url?: string
    is_active: boolean
    like_count: number
    comment_count: number
    isLiked?:boolean
    created_at: string
    updated_at: string
    author?: User
  }
  
  export interface Comment {
    id: string
    content: string
    user_id: string
    post_id: string
    created_at: string
    updated_at: string
    user?: User
  }
  
  export interface Follow {
    id: string
    follower_id: string
    following_id: string
    created_at: string
  }