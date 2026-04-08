export type StreamMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface LlmProvider {
  streamText(messages: StreamMessage[]): Promise<ReadableStream<string>>;
  completeJson<T>(messages: StreamMessage[], schemaHint: string): Promise<T | null>;
}
