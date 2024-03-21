import LanguageSelector from "./language-selector";
import SpeakerTranscript from "./speaker-transcript";
import TranscriptionMicrophone from "./transcription-microphone";

export default function TranscriptionDemo({
  initialDeepgramToken,
}: Readonly<{
  initialDeepgramToken: string;
}>) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex w-full items-center justify-center space-x-4 rounded-md">
        <TranscriptionMicrophone initialToken={initialDeepgramToken} />
        <LanguageSelector />
      </div>
      <div className="h-full">
        <SpeakerTranscript />
      </div>
    </div>
  );
}
