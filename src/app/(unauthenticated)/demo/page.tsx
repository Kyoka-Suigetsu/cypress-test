import { getDeepgramAiServerToken } from "@/lib/actions/deepgram";
import { cn } from "@/lib/utils";
import TranscriptionDemo from "./transcription-demo";
import Translations from "./translations";

export const dynamic = "force-dynamic";

export default async function Demo() {
  let initialDeepgramToken = "";

  const response = await getDeepgramAiServerToken();

  if (!(response instanceof Error)) {
    initialDeepgramToken = response.key;
  }

  return (
    <div className="z-30 h-full w-full py-2">
      <div className="mx-auto mt-4 flex max-w-[1100px] flex-col rounded-md">
        <div className="flex flex-col space-y-2 rounded-md px-2 py-6">
          <p className="text-center text-4xl font-bold">
            Try Lingopal Real-Time Translation
          </p>
          <div className={cn(["space-y-4 px-2"])}>
            <p className="text-center text-lg">
              Translate Your Conversations in Real-Time To Any Language
            </p>
          </div>
        </div>
      </div>
      <div className="m-4 mx-auto w-full max-w-[1100px] grid-cols-1 rounded-lg border border-gray-800 bg-content1 p-2 shadow-md lg:grid lg:max-h-[600px] lg:grid-cols-2 lg:space-x-7 lg:p-6">
        <TranscriptionDemo initialDeepgramToken={initialDeepgramToken} />
        <Translations />
      </div>
    </div>
  );
}
