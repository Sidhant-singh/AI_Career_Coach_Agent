import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { inngest } from "@/inngest/client";
import axios from "axios";

export async function POST(request:NextRequest) {
    const formData = await request.formData();
    const resumeFile:any = formData.get("resumeFile");
    const recordId = formData.get("recordId");

    const loader = new WebPDFLoader(resumeFile);
    const docs = await loader.load();
    console.log("Loaded documents:", docs[0]); // raw pdf text

    const arrayBuffer = await resumeFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const resultId = await inngest.send({
        name: 'AiResumeAgent',
        data: {
            recordId: recordId,
            base64ResumeFile : base64,
            pdfText: docs[0]?.pageContent, // raw pdf text
        },
    });

    const runId = resultId?.ids[0];

    let runStatus;

    while(true){
        runStatus = await getRuns(runId);
        console.log(runStatus?.data);
        if(runStatus?.data[0]?.status === 'Completed')
            break;
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 1 second before checking again
    }

    //console.log(NextResponse.json(runStatus.data?.[0].output[0]))
    // return NextResponse.json(runStatus.data?.[0].output?.output[0])
    const finalOutput = runStatus.data?.[0]?.output?.[0];
    if (!finalOutput) {
    return NextResponse.json({ error: "No output received" }, { status: 500 });
    }
    return NextResponse.json(finalOutput);
}


export async function getRuns(runId: string) {
    const result = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
    headers: {
        'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`
        // 'Content-Type': 'application/json',
    },
});

    // const result = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
    // headers: {
    //     'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
    //     'Content-Type': 'application/json'
    // }})
    return result.data;
}