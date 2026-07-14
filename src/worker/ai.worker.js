import { pipeline, env } from '@xenova/transformers';

// Disabling remote server reliance where possible for true local execution
env.allowLocalModels = false; 

let generatorPipeline = null;

// Initialize the pipeline instance
async function getPipeline(progressCallback) {
    if (!generatorPipeline) {
        // Using a highly optimized, tiny model ideal for hackathon testing
        generatorPipeline = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
            progress_callback: progressCallback
        });
    }
    return generatorPipeline;
}

// Listen for instructions from the main UI thread
self.addEventListener('message', async (event) => {
    const { type, payload } = event.data;

    if (type === 'LOAD_MODEL') {
        try {
            await getPipeline((data) => {
                if (data.status === 'progress') {
                    self.postMessage({ type: 'DOWNLOAD_PROGRESS', payload: data.progress });
                }
            });
            self.postMessage({ type: 'MODEL_READY' });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    }

    if (type === 'GENERATE_TEXT') {
        try {
            const generator = await getPipeline();
            
            // Traditional structural prompt formatting that Qwen models read natively
            const prompt = `<|im_start|>system\nYou are a helpful offline assistant. Extract data accurately from the provided text context.<|im_end|>\n<|im_start|>user\n${payload}<|im_end|>\n<|im_start|>assistant\n`;
            
            const output = await generator(prompt, {
                max_new_tokens: 100,
                temperature: 0.3,
                top_p: 0.9,
                do_sample: true
            });

            if (output && output[0] && output[0].generated_text) {
                const fullText = output[0].generated_text;
                // Strip the prompt prefix to isolate the model's new response text content
                let cleanResponse = fullText.substring(prompt.length).trim();
                
                // Clean up any trailing structural markup strings if the model repeats them
                cleanResponse = cleanResponse.split('<|im_end|>')[0].trim();
                
                if (cleanResponse.length > 0) {
                    self.postMessage({ type: 'STREAM_TOKEN', payload: cleanResponse });
                } else {
                    self.postMessage({ type: 'STREAM_TOKEN', payload: "The engine completed processing but returned an empty text layer. Let's try adjusting the prompt length." });
                }
            } else {
                self.postMessage({ type: 'STREAM_TOKEN', payload: "Could not execute local inference." });
            }

            self.postMessage({ type: 'GENERATION_COMPLETE' });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    }})