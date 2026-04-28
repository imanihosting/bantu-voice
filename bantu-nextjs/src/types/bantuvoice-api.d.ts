/**
 * Types for the BantuVoice FastAPI (served by `bantuvoice-serve`).
 *
 * Originally auto-generated from the legacy Chatterbox OpenAPI spec; now
 * maintained manually until `scripts/sync-api.ts` is repointed at the
 * BantuVoice OpenAPI endpoint (e.g. http://localhost:8000/openapi.json).
 *
 * NOTE: /generate-multi added manually for multi-speaker support.
 */
  export interface paths {
    "/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate Speech */
        post: operations["generate_speech_generate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/generate-multi": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate Multi-Speaker Speech */
        post: operations["generate_multi_speaker_generate_multi_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/transcribe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Transcribe Audio */
        post: operations["transcribe_audio_transcribe_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /**
         * TTSRequest
         * @description Request model for multilingual text-to-speech generation.
         */
        TTSRequest: {
            /** Prompt */
            prompt: string;
            /** Voice Key */
            voice_key?: string;
            /**
             * Language ID
             * @description ISO 639-1 language code (e.g. "en", "sw", "fr")
             * @default "en"
             */
            language_id?: string;
            /** BantuVoice diffusion knobs (post-Chatterbox migration). */
            num_step?: number;
            guidance_scale?: number;
            speed?: number;
            duration?: number;
            /** Voice-design instruction (BantuVoice). */
            instruct?: string;
            /** Optional reference transcript for voice cloning. */
            ref_text?: string;
            /** Legacy Chatterbox sampling knobs (ignored by BantuVoice). */
            temperature?: number;
            top_p?: number;
            exaggeration?: number;
            cfg_weight?: number;
            repetition_penalty?: number;
            min_p?: number;
        };
        /** TranscribeSegment */
        TranscribeSegment: {
            /** Start */
            start: number;
            /** End */
            end: number;
            /** Text */
            text: string;
        };
        /** TranscribeResponse */
        TranscribeResponse: {
            /** Text */
            text: string;
            /** Language */
            language: string;
            /** Duration Seconds */
            duration_seconds: number;
            /** Segments */
            segments: components["schemas"]["TranscribeSegment"][];
        };
        /** SpeakerLine */
        SpeakerLine: {
            /** Speaker */
            speaker: number;
            /** Text */
            text: string;
        };
        /**
         * MultiSpeakerTTSRequest
         * @description Request model for multi-speaker dialogue TTS generation (up to 4 speakers).
         */
        MultiSpeakerTTSRequest: {
            /** Script */
            script: components["schemas"]["SpeakerLine"][];
            /**
             * Voice Keys
             * @description Map of speaker number to S3 voice key
             */
            voice_keys: Record<string, string>;
            /**
             * CFG Weight
             * @default 0.5
             */
            cfg_weight: number;
            /**
             * Output Format
             * @default wav
             */
            output_format?: "wav" | "mp3";
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    generate_speech_generate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TTSRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "audio/wav": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    generate_multi_speaker_generate_multi_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MultiSpeakerTTSRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "audio/wav": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    transcribe_audio_transcribe_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** File */
                    file: Blob;
                    /** Language */
                    language?: string;
                };
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TranscribeResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
