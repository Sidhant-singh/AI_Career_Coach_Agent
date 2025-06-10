import React, { useState } from 'react'
import { File, Sparkles } from 'lucide-react';
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

function ResumeUploadDialog({ openResumeUpload, setOpenResumeDialog }: any) {

    const [file, setFile] = useState<any>();
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Handle the file upload logic here
            console.log(file.name);
            // You can also close the dialog after file selection
            setFile(file);
        }
    };

    const onUploadAndAnalyze = () => {
        const recordId = uuidv4();
        const formData = new FormData();
        formData.append('recordId', recordId);
        formData.append('resumeFile', file);
        // send the form data to your API endpoint
    }


    return (
        <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload resume PDF file</DialogTitle>
                    <DialogDescription>
                        <div>
                            <label htmlFor='resumeUpload' className='flex items-center flex-col justify-center p-7 border border-dashed rounded-xl hover:bg-slate-100 cursor-pointer'>
                                <File className='h-10 w-10' />
                                {file ?
                                    <h2 className='mt-3 text-blue-600'>{file?.name}</h2>:
                                <h2 className='mt-3'>Click here to upload PDF file</h2>}
                            </label>
                            <input type='file' id='resumeUpload' className='hidden' accept='.pdf'
                            onChange={onFileChange} />
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant='outline' onClick={() => setOpenResumeDialog(false)}>Cancel</Button>
                    <Button disabled = {!file} onClick={onUploadAndAnalyze}>
                        <Sparkles className='mr-2 h-4 w-4' />
                        Upload & Analyze
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ResumeUploadDialog;
