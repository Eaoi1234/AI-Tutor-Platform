import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY || 'YOUR_CLOUDCONVERT_API_KEY_HERE';
// Define the interface for the CloudConvert job creation response data
interface CloudConvertCreateJobResponse {
  data: {
    id: string;
    status: string;
    tasks: Array<any>; // You could define more specific types for tasks if needed
  };
  message?: string;
}

export async function docToDocxConvert(docBuffer: Buffer, originalFileName: string): Promise<Buffer> {
  

  if (!CLOUDCONVERT_API_KEY || CLOUDCONVERT_API_KEY === 'YOUR_CLOUDCONVERT_API_KEY_HERE') {
    throw new Error('CloudConvert API Key is not configured. Please set CLOUDCONVERT_API_KEY environment variable or replace the placeholder.');
  }

  try {
    const createJobResponse = await axios.post<CloudConvertCreateJobResponse>( // <--- Type the response here
      'https://api.sandbox.cloudconvert.com/v2/jobs',
      {
        tasks: {
          'upload-file': {
            operation: 'import/base64',
            file: docBuffer.toString('base64'),
            filename: originalFileName,
          },
          'convert-file': {
            operation: 'convert',
            input: 'upload-file',
            output_format: 'docx',
            filename: `${originalFileName.split('.')[0]}.docx`,
          },
          'export-file': {
            operation: 'export/url',
            input: 'convert-file',
            inline: false,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Now TypeScript knows that createJobResponse.data has an 'id' property
    const jobId = createJobResponse.data.data.id;
    console.log(`[CloudConvert] Job created with ID: ${jobId}. Waiting for completion...`);

    let jobStatusResponse;
    let jobStatus = '';
    let exportUrl: string | undefined;
    const pollingInterval = 3000;

    while (jobStatus !== 'finished' && jobStatus !== 'error' && jobStatus !== 'failed') {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      jobStatusResponse = await axios.get<CloudConvertCreateJobResponse>(`https://api.sandbox.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`,
        },
      });
      jobStatus = jobStatusResponse.data.data.status;
      console.log(`[CloudConvert] Job status: ${jobStatus}`);

      if (jobStatus === 'finished') {
        const exportTask = jobStatusResponse.data.data.tasks.find(
          (task: any) => task.name === 'export-file' && task.status === 'finished'
        );
        if (exportTask && exportTask.result && exportTask.result.files && exportTask.result.files[0]) {
          exportUrl = exportTask.result.files[0].url;
        } else {
          throw new Error('[CloudConvert] Export file URL not found in finished job.');
        }
      } else if (jobStatus === 'error' || jobStatus === 'failed') {
        const errorTask = jobStatusResponse.data.data.tasks.find((t: any) => t.status === 'error' || t.status === 'failed');
        const errorMessage = errorTask ? errorTask.message : 'Unknown conversion error.';
        throw new Error(`[CloudConvert] Conversion job failed: ${errorMessage}`);
      }
    }

    if (!exportUrl) {
      throw new Error('[CloudConvert] Failed to obtain export URL after job completion.');
    }

    console.log(`[CloudConvert] Downloading converted file from: ${exportUrl}`);
    const downloadResponse = await axios.get(exportUrl, {
      responseType: 'arraybuffer',
    });

    console.log('[CloudConvert] Conversion and download successful.');
    return Buffer.from(downloadResponse.data as ArrayBuffer);
  } catch (error) {
    console.error(
      '[CloudConvert] Error converting .doc to .docx:',
      error instanceof Error ? error.message : error
    );
    throw new Error(`Failed to convert .doc file using CloudConvert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}