// import React, { useState } from 'react'
// import { File, Loader2Icon, Sparkles } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from '@/components/ui/button';
// import { v4 as uuidv4 } from 'uuid';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// function ResumeUploadDialog({ openResumeUpload, setOpenResumeDialog }: any) {

//     const [file, setFile] = useState<any>();
//     const [loading,setLoading] = useState(false);
//     const router = useRouter();
//     const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             // Handle the file upload logic here
//             console.log(file.name);
//             // You can also close the dialog after file selection
//             setFile(file);
//         }
//     };

//     const onUploadAndAnalyze = async() => {
//         setLoading(true);
//         const recordId = uuidv4();
//         const formData = new FormData();
//         formData.append('recordId', recordId);
//         formData.append('resumeFile', file);
//        // formData.append('aiAgentType','/ai-tools/ai-resume-analyzer')
//         // send the form data to your API endpoint

//         console.log('logginggggggggggggggggggggg')
//         const result = await axios.post('/api/ai-resume-agent',formData);
//         console.log('kch return hua kyaa ????????')
//         console.log(result.data)
//         setLoading(false);
//         router.push(`/ai-tools/ai-resume-analyzer/${recordId}`);
//         setOpenResumeDialog(false); 
//     }


//     return (
//         <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>Upload resume PDF file</DialogTitle>
//                     <DialogDescription>
//                         <div>
//                             <label htmlFor='resumeUpload' className='flex items-center flex-col justify-center p-7 border border-dashed rounded-xl hover:bg-slate-100 cursor-pointer'>
//                                 <File className='h-10 w-10' />
//                                 {file ?
//                                     <h2 className='mt-3 text-blue-600'>{file?.name}</h2>:
//                                 <h2 className='mt-3'>Click here to upload PDF file</h2>}
//                             </label>
//                             <input type='file' id='resumeUpload' className='hidden' accept='.pdf'
//                             onChange={onFileChange} />
//                         </div>
//                     </DialogDescription>
//                 </DialogHeader>

//                 <DialogFooter>
//                     <Button variant='outline' onClick={() => setOpenResumeDialog(false)}>Cancel</Button>
//                     <Button disabled = {!file || loading} onClick={onUploadAndAnalyze}>
//                         {loading ? <Loader2Icon className='animate-spin' /> :<Sparkles className='mr-2 h-4 w-4' />}
//                         Upload & Analyze
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

// export default ResumeUploadDialog;


import React, { useState } from 'react'
import { File, Loader2Icon, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // or your preferred toast library

function ResumeUploadDialog({ openResumeUpload, setOpenResumeDialog }: any) {
    const [file, setFile] = useState<any>();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                toast.error('Please select a PDF file');
                return;
            }
            
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            
            console.log('Selected file:', file.name);
            setFile(file);
        }
    };

    const onUploadAndAnalyze = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        try {
            setLoading(true);
            const recordId = uuidv4();
            const formData = new FormData();
            formData.append('recordId', recordId);
            formData.append('resumeFile', file);

            console.log('Starting upload and analysis...');
            
            const result = await axios.post('/api/ai-resume-agent', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 120000, // 2 minutes timeout
            });

            console.log('API Response:', result.data);

            if (result.data.success) {
                toast.success('Resume analyzed successfully!');
                setOpenResumeDialog(false);
                router.push(`/ai-tools/ai-resume-analyzer/${recordId}`);
            } else {
                toast.error('Analysis failed: ' + (result.data.error || 'Unknown error'));
            }

        } catch (error) {
            console.error('Upload error:', error);
            
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    toast.error('Request timeout. Please try again.');
                } else if (error.response?.status === 408) {
                    toast.error('Analysis is taking longer than expected. Please try again.');
                } else if (error.response?.data?.error) {
                    toast.error('Error: ' + error.response.data.error);
                } else {
                    toast.error('Network error. Please try again.');
                }
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload resume PDF file</DialogTitle>
                    <DialogDescription>
                        <div>
                            <label 
                                htmlFor='resumeUpload' 
                                className='flex items-center flex-col justify-center p-7 border border-dashed rounded-xl hover:bg-slate-100 cursor-pointer transition-colors'
                            >
                                <File className='h-10 w-10' />
                                {file ? (
                                    <div className='mt-3 text-center'>
                                        <h2 className='text-blue-600 font-medium'>{file.name}</h2>
                                        <p className='text-sm text-gray-500 mt-1'>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className='mt-3 text-center'>
                                        <h2>Click here to upload PDF file</h2>
                                        <p className='text-sm text-gray-500 mt-1'>
                                            Maximum file size: 5MB
                                        </p>
                                    </div>
                                )}
                            </label>
                            <input 
                                type='file' 
                                id='resumeUpload' 
                                className='hidden' 
                                accept='.pdf'
                                onChange={onFileChange} 
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button 
                        variant='outline' 
                        onClick={() => setOpenResumeDialog(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        disabled={!file || loading} 
                        onClick={onUploadAndAnalyze}
                    >
                        {loading ? (
                            <>
                                <Loader2Icon className='animate-spin mr-2 h-4 w-4' />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Upload & Analyze
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ResumeUploadDialog;