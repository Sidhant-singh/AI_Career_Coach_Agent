"use client";
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { aiToolsList } from './AiToolsList';
import Link from 'next/link'; // ✅ Fix this line
import { Download, FileText, Video, Code, Clock, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function History() {
    const [userHistory, setUserHistory] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect(()=>{
        GetHistory();
    },[])

    const GetHistory = async()=>{
        setLoading(true)
        const result = await axios.get('/api/history');
        console.log(result.data);
        setUserHistory(result.data)
        setLoading(false)
    }

    const GetAgentName = (path : string) =>{
        const agent = aiToolsList.find(item => item.path == path)
        return agent
    }
    return (
        <div className='mt-5 p-5 border rounded-xl'>
            <h2 className='font-bold text-lg'>Previous History</h2>
            <p className=''>What Your Previously work on, You can find here.</p>

            {loading && 
            <div>
                {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="my-2">
                        <Skeleton className="h-[50px] mt-4 w-full rounded-md" />
                    </div>
))}

            </div>
            }

            {userHistory?.length == 0 && !loading ? 
                <div className='flex items-center justify-center mt-5 flex-col mt-6'>
                    <Image src={'/idea.png'} alt='bulb' width={50} height={50}/>
                    <h2> You do not have any history</h2> 
                    <Button className='mt-5'>Explore AI Tools</Button>
                </div>
                :
                <div>
                    {userHistory?.map((history:any,index:number) =>{
                        const agent = GetAgentName(history?.aiAgentType);
                        const isInterview = history?.aiAgentType?.includes('interview-agent');
                        
                        return (
                            <div key={index} className='flex justify-between items-center my-3 border p-4 rounded-lg hover:bg-gray-50 transition-colors'>
                                <Link href={history?.aiAgentType + "/" + history?.recordId} className='flex gap-5 items-center flex-1'>
                                    <div className='flex gap-3 items-center'>
                                        <Image 
                                            src={agent?.icon || '/idea.png'} 
                                            alt={'agent-icon'}
                                            width={24}
                                            height={24}
                                            className="rounded"
                                        />
                                        <div>
                                            <h2 className="font-semibold">{agent?.name || 'AI Tool'}</h2>
                                            {isInterview && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                        {history?.interviewType || 'Technical'}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        {history?.domain || 'Interview'}
                                                    </span>
                                                    {history?.finalScore && (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center gap-1">
                                                            <Star className="h-3 w-3" />
                                                            {history.finalScore}/100
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                
                                <div className="flex items-center gap-3">
                                    {isInterview && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span>{history?.interviewDuration || 10}min</span>
                                        </div>
                                    )}
                                    
                                    <div className="text-sm text-gray-500">
                                        {history.createdAt}
                                    </div>
                                    
                                    {/* PDF Download Button */}
                                    {isInterview && history?.pdfReportUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.open(history.pdfReportUrl, '_blank');
                                            }}
                                            className="flex items-center gap-1"
                                        >
                                            <FileText className="h-4 w-4" />
                                            PDF
                                        </Button>
                                    )}
                                    
                                    {/* Avatar Video Button */}
                                    {isInterview && history?.avatarVideoUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.open(history.avatarVideoUrl, '_blank');
                                            }}
                                            className="flex items-center gap-1"
                                        >
                                            <Video className="h-4 w-4" />
                                            Video
                                        </Button>
                                    )}
                                    
                                    {/* Code Analysis Button for DSA */}
                                    {isInterview && history?.interviewType === 'dsa' && history?.codeAnalysis && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Show code analysis modal or navigate to detailed view
                                                alert(`Code Analysis:\nCorrectness: ${history.codeAnalysis.correctness}/100\nEfficiency: ${history.codeAnalysis.efficiency}/100\nTime Complexity: ${history.codeAnalysis.time_complexity}`);
                                            }}
                                            className="flex items-center gap-1"
                                        >
                                            <Code className="h-4 w-4" />
                                            Code
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
        }
        </div>
    )    
}

export default History

// "use client";
// import React, { useEffect, useState } from 'react'
// import Image from 'next/image';
// import { Button } from '@/components/ui/button';
// import axios from 'axios';
// import { aiToolsList } from './AiTools';

// function History() {
//     const [userHistory, setUserHistory] = useState<any[]>([]);

//     useEffect(()=>{
//         GetHistory();
//     },[])

//     const GetHistory = async()=>{
//         const result = await axios.get('/api/history');
//         console.log(result.data);
//         // Ensure we're setting an array
//         setUserHistory(Array.isArray(result.data) ? result.data : []);
//     }

//     const GetAgentName = (path : string) =>{
//         const agent = aiToolsList.find(item => item.path == path)
//         return agent
//     }
    
//     return (
//         <div className='mt-5 p-5 border rounded-xl'>
//             <h2 className='font-bold text-lg'>Previous History</h2>
//             <p className=''>What Your Previously work on, You can find here.</p>

//             {userHistory?.length == 0 ? 
//                 <div className='flex items-center justify-center mt-5 flex-col mt-6'>
//                     <Image src={'/idea.png'} alt='bulb' width={50} height={50}/>
//                     <h2> You do not have any history</h2> 
//                     <Button className='mt-5'>Explore AI Tools</Button>
//                 </div>
//                 :
//                 <div>
//                     {userHistory?.map((history:any,index:number) =>(
//                         <div key = {index} className='flex gap-5'>
//                             <Image src = {GetAgentName(history?.aiAgentType)?.icon} alt = {'image'}
//                                 width={20}
//                                 height={20}
//                             />
//                             <h2>{GetAgentName(history?.aiAgentType)?.name}</h2>
//                         </div>
//                     ))}
//                 </div>
//             }
//         </div>
//     )    
// }

// export default History