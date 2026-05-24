'use client'

import { useState, useEffect } from 'react'


interface Post{
    id:string
    content:string
    author:{
        username:string
    }
}

export default function Random() {
  const [details, setDetails] = useState<Post [] | []>([])

  useEffect(() => {
    const getData = async () => {
      const res = await fetch('/api/feed')
      const data = await res.json()
      setDetails(data.posts || []) 
      console.log(data)
    }
    getData()
  }, [])

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl text-white font-bold">My Simple Feed</h1>
 
{details.map((post:Post) => {
        return (
          <div key={post.id} className="p-3 border rounded-xl shadow-sm bg-neutral-50 dark:bg-neutral-900">
            <p className="font-semibold text-white text-sm">Post Content:</p>
            <h3 className='text-blue-300'>{post.author.username}</h3>
            <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
          </div>
        )
      })}
    </div>
  )
}