import { STARTUP_BY_ID_QUERY } from '@/lib/query';
import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import React from 'react'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const startup_id = (await params).id;

    const post = await client.fetch(STARTUP_BY_ID_QUERY, { id: startup_id });

    if (!post) return notFound();
    return (
        <div className='text-3xl'>
            {post.title}
        </div>
    )
}

export default Page;
