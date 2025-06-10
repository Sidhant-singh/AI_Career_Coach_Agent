"use client";
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // ✅ Correct
import { v4 as uuidv4 } from 'uuid'; // Importing uuid for unique IDs
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import axios from 'axios';


interface TOOL{
    name: string;
    desc: string;
    icon: string;
    button: string;
    path : string;
}

type AIToolProps = {
    tool: TOOL;
}

function AiToolCard({tool}:AIToolProps ) {
    const id = uuidv4();
    const { user } = useUser();
    const router = useRouter();
    
    
    const onClickButton = async() =>{
        // create a new history entry for the user
        const result = await axios.post('/api/history', {
            recordId : id,
            content : []
        });
        console.log(result)
        router.push(tool.path+"/"+id); // Navigate to the tool's path with the unique ID
    }// Assuming you have a user context or hook to get the current user
    return (
        <div className='p-3 border rounded-lg'>
            <Image src={tool.icon} width={40} height={40} alt='tool.name'/>
            <h2 className='font-bold mt-2'>{tool.name}</h2>
            <p className='text-gray-400'>{tool.desc}</p>
            <Link href={tool.path + "/" + id}>
                <Button className='w-full mt-3' onClick={onClickButton}>
                    {tool.button}
                </Button>
            </Link>
        </div>
    )
}

export default AiToolCard